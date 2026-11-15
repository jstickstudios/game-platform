import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  clearFails,
  createSession,
  ensureFounder,
  recordFail,
  startLoginChallenge,
  tooManyAttempts,
  verifyPassword,
} from "@/lib/auth";
import { sendLoginCode } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");
  if (!username || !password) {
    return Response.json({ error: "Enter your username and password." }, { status: 400 });
  }
  const key = username.toLowerCase();
  if (tooManyAttempts(key)) {
    return Response.json(
      { error: "Too many failed attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  await ensureFounder();
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    recordFail(key);
    return Response.json({ error: "Wrong username or password." }, { status: 401 });
  }
  clearFails(key);

  // Email login codes only activate when RESEND_API_KEY is set AND the account
  // has an email. Until then: normal password login (feature sleeps, site never breaks).
  const emailReady = Boolean(process.env.RESEND_API_KEY) && Boolean(user.email);

  if (!emailReady) {
    await createSession(user.id);
    return Response.json({ ok: true, username: user.username, isFounder: user.isFounder });
  }

  // Password is correct — send the 6-digit email code.
  const code = await startLoginChallenge(user.id);
  const sent = await sendLoginCode(user.email as string, code, user.username);

  if (!sent) {
    // Local testing without RESEND_API_KEY: show the code instead of emailing it.
    if (process.env.NODE_ENV !== "production") {
      return Response.json({ ok: true, challenge: "email", devCode: code });
    }
    return Response.json(
      { error: "Could not send the email right now. Try again in a minute." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, challenge: "email" });
}
