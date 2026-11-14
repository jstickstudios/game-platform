import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  clearFails,
  createSession,
  ensureFounder,
  recordFail,
  tooManyAttempts,
  verifyPassword,
} from "@/lib/auth";

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
  await createSession(user.id);
  return Response.json({ ok: true, username: user.username, isFounder: user.isFounder });
}
