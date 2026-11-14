import { db } from "@/db";
import { purchases } from "@/db/schema";
import { getUser, hasAccess } from "@/lib/auth";
import { getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

/**
 * Starts a purchase.
 *  - With STRIPE_SECRET_KEY set: creates a Stripe-hosted Checkout Session. The customer
 *    enters card / bank (iDEAL etc.), approves the agreements and does 3-D Secure on
 *    Stripe's page. Card & bank details never touch this server and are never stored.
 *  - Without a key: "test mode" — no money moves, access is granted for previewing.
 */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Log in first." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const game = getGame(String(body?.slug ?? ""));
  if (!game) return Response.json({ error: "Game not found." }, { status: 404 });
  if (body?.agree !== true)
    return Response.json({ error: "Please approve the agreements to continue." }, { status: 400 });
  if (await hasAccess(user, game.slug)) return Response.json({ ok: true, owned: true });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    await db
      .insert(purchases)
      .values({
        userId: user.id,
        gameSlug: game.slug,
        provider: "test",
        providerRef: null,
        amountCents: game.priceCents,
        currency: game.currency,
      })
      .onConflictDoNothing();
    return Response.json({ ok: true, testMode: true });
  }

  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const origin = `${proto}://${host}`;

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${origin}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/checkout/${game.slug}?cancelled=1`);
  form.set("client_reference_id", String(user.id));
  form.set("metadata[userId]", String(user.id));
  form.set("metadata[slug]", game.slug);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", game.currency);
  form.set("line_items[0][price_data][unit_amount]", String(game.priceCents));
  form.set("line_items[0][price_data][product_data][name]", game.title);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const data = (await res.json().catch(() => null)) as { url?: string; error?: { message?: string } } | null;
  if (!res.ok || !data?.url) {
    return Response.json(
      { error: data?.error?.message ?? "Could not start the payment. Try again." },
      { status: 502 },
    );
  }
  return Response.json({ ok: true, url: data.url });
}
