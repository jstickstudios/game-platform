import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, ensureFounder, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const agree = body?.agree === true;
  const adult = body?.adult === true;

  if (!/^[A-Za-z0-9_]{3,20}$/.test(username))
    return Response.json(
      { error: "Username must be 3–20 characters: letters, numbers or underscore." },
      { status: 400 },
    );
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8)
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (!adult)
    return Response.json({ error: "You must confirm you are 18 or older." }, { status: 400 });
  if (!agree)
    return Response.json({ error: "Please accept the terms to create an account." }, { status: 400 });

  await ensureFounder();
  const taken = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.username}) = ${username.toLowerCase()}`)
    .limit(1);
  if (taken.length) return Response.json({ error: "That username is already taken." }, { status: 409 });

  const [created] = await db
    .insert(users)
    .values({ username, email, passwordHash: hashPassword(password) })
    .returning({ id: users.id });
  const check = await db.select({ id: users.id }).from(users).where(eq(users.id, created.id));
  if (!check.length) return Response.json({ error: "Could not create account." }, { status: 500 });

  await createSession(created.id);
  return Response.json({ ok: true });
}
