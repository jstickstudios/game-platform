import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import GameCard from "@/components/GameCard";
import Reveal from "@/components/Reveal";
import { Marquee, Promo, Features, HowItWorks, Footer } from "@/components/Sections";
import { getUser, hasAccess } from "@/lib/auth";
import { GAMES, formatPrice } from "@/lib/games";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const sp = await searchParams;
  const user = await getUser();
  const game = GAMES[0];
  const owned = await hasAccess(user, game.slug);
  const mode = !user ? "guest" : user.isFounder ? "founder" : owned ? "owner" : "buyer";

  return (
    <div className="min-h-screen">
      <Nav />

      {sp.payment === "success" && (
        <div className="bg-emerald-500/15 px-5 py-3 text-center text-sm font-semibold text-emerald-200">
          ✓ Payment complete — your game is unlocked. Download it below!
        </div>
      )}
      {sp.payment === "run" && (
        <div className="bg-emerald-500/15 px-5 py-3 text-center text-sm font-semibold text-ememerald-200">
          Welcome back — your games are unlocked. Download below!
        </div>
      )}
      {sp.payment === "failed" && (
        <div className="bg-red-500/15 px-5 py-3 text-center text-sm font-semibold text-red-200">
          The payment could not be confirmed. You were not charged for an unlocked game — try again.
        </div>
      )}

      <Hero games={GAMES} />

      <Marquee />

      {/* GAMES GRID */}
      <section id="games" className="mx-auto mt-20 w-full max-w-[1400px] scroll-mt-24 px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">Our games</h2>
              <p className="mt-1 text-sm text-white/45">Download, open in Chrome, and play in seconds</p>
            </div>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g, i) => (
            <Reveal key={g.slug} delay={i * 100}>
              <GameCard game={g} index={i} />
            </Reveal>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-6 text-center opacity-70">
          More games are in the works. Stay tuned.
          <span className="ml-2" aria-hidden>
            <Stickman pose="idle" className="inline h-5 w-4 text-white/50" stroke={8} />
          </span>
        </div>
      </section>

      <Promo />

      <Features />

      <HowItWorks price={formatPrice(game.priceCents)} />

      <Footer />
    </div>
  );
}
