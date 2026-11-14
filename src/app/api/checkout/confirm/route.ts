import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

// Stripe sends the customer back here after paying. We ask Stripe directly whether the
// session was really paid (never trust the URL alone), then unlock the game.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  const origin = `${proto}://${host}`;
  const back = (q: string) => NextResponse.redirect(`${origin}/${q}`);

  const user = await getUser();
  const sessionId = url.searchParams.get("session_id");
  const key = process.env.STRIPE_SECRET_KEY;
  if (!user || !sessionId || !key) return back("login");

  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) return back("?payment=failed");
  const s = (await res.json()) as {
    payment_status?: string;
    amount_total?: number;
    currency?: string;
    metadata?: { userId?: string; slug?: string };
  };
  const game = getGame(s.metadata?.slug ?? "");
  if (s.payment_status !== "paid" || !game || s.metadata?.userId !== String(user.id)) {
    return back("?payment=failed");
  }
  await db
    .insert(purchases)
    .values({
      userId: user.id,
      gameSlug: game.slug,
      provider: "stripe",
      providerRef: sessionId,
      amountCents: s.amount_total ?? game.priceCents,
      currency: s.currency ?? game.currency,
    })
    .onConflictDoNothing();
  return back(`?payment=success&game=${game.slug}`);
}
