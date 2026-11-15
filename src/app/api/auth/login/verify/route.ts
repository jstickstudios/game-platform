import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  clearFails,
  clearLoginChallenge,
  createSession,
  recordFail,
  tooManyAttempts,
  verifyLoginChallenge,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    return Response.json(
      { error: "Enter the 6-digit code from your email." },
      { status: 400 },
    );
  }

  const userId = await verifyLoginChallenge(code);
  if (userId === null || Number.isNaN(userId)) {
    const jarUserId = await peekChallengeUser();
    if (jarUserId !== null) {
      const key = `2fa:${jarUserId}`;
      if (tooManyAttempts(key)) {
        return Response.json(
          { error: "Too many wrong codes. Start again with your password." },
          { status: 429 },
        );
      }
      recordFail(key);
    }
    return Response.json(
      { error: "Wrong or expired code. Request a new one or log in again." },
      { status: 401 },
    );
  }

  const key = `2fa:${userId}`;
  clearFails(key);
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user) {
    return Response.json({ error: "Account not found." }, { status: 401 });
  }

  await clearLoginChallenge();
  await createSession(user.id);
  return Response.json({ ok: true, username: user.username, isFounder: user.isFounder });
}

// Which user does the pending challenge belong to? (for rate limiting wrong codes)
async function peekChallengeUser(): Promise<number | null> {
  const { cookies } = await import("next/headers");
  const crypto = (await import("node:crypto")).default;
  const jar = await cookies();
  const raw = jar.get("jstick_2fa")?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const id = Number(parts[0]);
  return Number.isNaN(id) ? null : id;
}
