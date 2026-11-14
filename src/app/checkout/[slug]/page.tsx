import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav";
import CheckoutForm from "@/components/CheckoutForm";
import { getUser, hasAccess } from "@/lib/auth";
import { formatPrice, getGame } from "@/lib/games";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { slug } = await params;
  const { cancelled } = await searchParams;
  const game = getGame(slug);
  if (!game) notFound();

  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/checkout/" + slug)}`);
  if (await hasAccess(user, slug)) redirect("/#games");

  const live = Boolean(process.env.STRIPE_SECRET_KEY);
  const price = formatPrice(game.priceCents);

  return (
    <div className="grid-bg min-h-screen">
      <Nav />
      <main className="mx-auto grid max-w-4xl gap-6 px-5 py-14 md:grid-cols-2">
        <div className="glass overflow-hidden rounded-2xl">
          <div className="relative h-48">
            <Image src="/images/neon-stickman-art.jpg" alt={game.title} fill sizes="400px" className="object-cover" />
          </div>
          <div className="space-y-2 p-6">
            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">18+ Gore</span>
            <h1 className="text-2xl font-black">{game.title}</h1>
            <p className="text-sm opacity-70">Digital download · play offline in Chrome</p>
            <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
              <span className="opacity-70">Total</span>
              <span className="text-3xl font-black">{price}</span>
            </div>
            <p className="text-xs opacity-60">Buying as <b>{user.username}</b></p>
          </div>
        </div>

        <div className="glass rise space-y-4 rounded-2xl p-6">
          <h2 className="text-xl font-black">Checkout</h2>
          {cancelled && (
            <div className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-sm text-yellow-100">
              Payment cancelled — you haven&apos;t been charged.
            </div>
          )}
          {!live && (
            <div className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
              <b>Test mode:</b> online payments aren&apos;t connected yet (no <code>STRIPE_SECRET_KEY</code> set), so this
              purchase is free and unlocks the game for preview. Add the key to take real payments.
            </div>
          )}
          <CheckoutForm slug={game.slug} price={price} live={live} />
          <Link href="/" className="block text-center text-sm underline opacity-70">
            ← Back to the studio
          </Link>
        </div>
      </main>
    </div>
  );
}
