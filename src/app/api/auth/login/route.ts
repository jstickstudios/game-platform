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

  // Founder accounts skip the email code — password is enough (VIP fast lane).
  if (user.isFounder) {
    await createSession(user.id);
    return Response.json({ ok: true, username: user.username, isFounder: user.isFounder });
  }

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

  if (!sent.ok) {
    // Local testing without RESEND_API_KEY: show the code instead of emailing it.
    if (process.env.NODE_ENV !== "production") {
      return Response.json({ ok: true, challenge: "email", devCode: code });
    }
    // Explain exactly why the email bounced, so it's fixable in one step.
    let error = "Could not send the email right now. Try again in a minute.";
    if (sent.status === 401) {
      error =
        "Email service rejected the API key — check RESEND_API_KEY in Vercel (Settings → Environment Variables), save, and Redeploy.";
    } else if (sent.status === 403) {
      error =
        "The free test sender can only email the address you signed up to Resend with. Change your account's email to match it, or verify jstickstudios.com in Resend (Phase 2) to email any player.";
    } else if (sent.status === 429) {
      error = "The email service hit its daily limit. Try again tomorrow or upgrade the free plan.";
    }
    return Response.json({ error }, { status: 502 });
  }

  return Response.json({ ok: true, challenge: "email", email: user.email });
}
