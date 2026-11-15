import crypto from "node:crypto";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { purchases, users } from "@/db/schema";

const COOKIE = "jstick_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

// Founder account: only a salted scrypt hash lives in the code, never the password.
const FOUNDER_USERNAME = "Jstickfounder";
const FOUNDER_HASH =
  "57e8d10277e1cdf403f4a8c5b20cf0d7:f7cde22c3763c4367babce46bbd55be1a5d393338d6569c3db7d016145689c69ed5fbc42212c2201533a410aa0c29bda7ab12a393614a494f4ba91577a6b67a1";

const FRIEND_USERNAME = "friendchi";
// Shared friend login; visible to anyone who can read this source.
const FRIEND_PASSWORD = "imafriend";

function secret() {
  return (
    process.env.SESSION_SECRET ||
    crypto
      .createHash("sha256")
      .update("jstick-session::" + (process.env.DATABASE_URL ?? ""))
      .digest("hex")
  );
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const real = Buffer.from(hash, "hex");
  return real.length === test.length && crypto.timingSafeEqual(real, test);
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export async function createSession(userId: number) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${userId}.${exp}`;
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "1",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export type SessionUser = {
  id: number;
  username: string;
  isFounder: boolean;
};

export async function getUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  const expected = sign(`${id}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  const rows = await db
    .select({ id: users.id, username: users.username, isFounder: users.isFounder })
    .from(users)
    .where(eq(users.id, Number(id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function ensureFounder() {
  await db
    .insert(users)
    .values({
      username: FOUNDER_USERNAME,
      passwordHash: FOUNDER_HASH,
      isFounder: true,
    })
    .onConflictDoNothing();
}

// Creates or repairs the shared friend account using a salted database hash.
export async function ensureFriend() {
  const existing = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.username, FRIEND_USERNAME))
    .limit(1);

  if (existing.length) {
    if (!verifyPassword(FRIEND_PASSWORD, existing[0].passwordHash)) {
      await db
        .update(users)
        .set({ passwordHash: hashPassword(FRIEND_PASSWORD), email: null, isFounder: false })
        .where(eq(users.id, existing[0].id));
    }
    return;
  }

  await db
    .insert(users)
    .values({
      username: FRIEND_USERNAME,
      passwordHash: hashPassword(FRIEND_PASSWORD),
      email: null,
      isFounder: false,
    })
    .onConflictDoNothing();
}

export async function hasAccess(user: SessionUser | null, slug: string) {
  if (!user) return false;
  if (user.isFounder || user.username.toLowerCase() === FRIEND_USERNAME) return true;
  const rows = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.userId, user.id), eq(purchases.gameSlug, slug)))
    .limit(1);
  return rows.length > 0;
}

// very small in-memory brute-force guard for logins
const attempts = new Map<string, { n: number; t: number }>();
export function tooManyAttempts(key: string) {
  const a = attempts.get(key);
  if (!a || Date.now() - a.t > 10 * 60_000) return false;
  return a.n >= 8;
}
export function recordFail(key: string) {
  const a = attempts.get(key);
  if (!a || Date.now() - a.t > 10 * 60_000) attempts.set(key, { n: 1, t: Date.now() });
  else a.n++;
}
export function clearFails(key: string) {
  attempts.delete(key);
}

// ---- Email login code (2FA) ----
// The challenge lives in a signed, httpOnly cookie: userId.hash(code).exp.signature
// No database table needed, and it works on serverless.
const CHALLENGE_COOKIE = "jstick_2fa";
const CHALLENGE_MAX_AGE = 10 * 60; // 10 minutes

function codeHash(code: string) {
  return crypto
    .createHash("sha256")
    .update("jstick-2fa-code::" + code)
    .digest("hex");
}

export async function startLoginChallenge(userId: number) {
  const code = String(crypto.randomInt(100000, 1000000)); // 6 digits
  const exp = Math.floor(Date.now() / 1000) + CHALLENGE_MAX_AGE;
  const payload = `${userId}.${codeHash(code)}.${exp}`;
  const jar = await cookies();
  jar.set(CHALLENGE_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "1",
    path: "/",
    maxAge: CHALLENGE_MAX_AGE,
  });
  return code;
}

export async function verifyLoginChallenge(code: string): Promise<number | null> {
  const jar = await cookies();
  const raw = jar.get(CHALLENGE_COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [id, hash, exp, sig] = parts;
  const payload = `${id}.${hash}.${exp}`;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(payload));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  if (codeHash(String(code).trim()) !== hash) return null;
  return Number(id);
}

export async function clearLoginChallenge() {
  const jar = await cookies();
  jar.delete(CHALLENGE_COOKIE);
}
