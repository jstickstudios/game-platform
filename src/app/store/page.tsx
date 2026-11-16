import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import GameCard from "@/components/GameCard";
import GameCarousel from "@/components/GameCarousel";
import Reveal from "@/components/Reveal";
import Stickman from "@/components/Stickman";
import { Marquee, Promo, Features, HowItWorks, Footer } from "@/components/Sections";
import { GAMES, formatPrice } from "@/lib/games";

export const dynamic = "force-dynamic";

export default async function Store({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <Nav />
      {sp.payment === "success" && (
        <div className="border-b border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-center text-sm font-semibold text-emerald-200">
          ✓ Payment complete — your game is unlocked. Download it below!
        </div>
      )}
      {sp.payment === "failed" && (
        <div className="border-b border-red-400/20 bg-red-500/10 px-5 py-3 text-center text-sm font-semibold text-red-200">
          The payment could not be confirmed. You were not charged for an unlocked game — try again.
        </div>
      )}

      <Hero games={GAMES} />
      <Marquee />

      <section id="games" className="mx-auto mt-12 w-full max-w-[1180px] scroll-mt-24 px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-px w-6 shrink-0 bg-brand-2 shadow-[0_0_12px_#26bbff]" />
              <div className="min-w-0">
                <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-brand-2">The collection</span>
                <h2 className="text-xl font-black tracking-tight sm:text-2xl">Find your next game.</h2>
                <p className="mt-1 hidden text-xs text-white/45 sm:block">Original games made by JStick Studios. Pick one and jump in.</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-white/65">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-2 shadow-[0_0_10px_#26bbff]" />
              {GAMES.length} {GAMES.length === 1 ? "game" : "games"}
            </span>
          </div>
        </Reveal>
        <GameCarousel>
          {GAMES.map((g, i) => (
            <div key={g.slug} className="w-[min(82vw,380px)] shrink-0">
              <Reveal delay={i * 100}>
                <GameCard game={g} />
              </Reveal>
            </div>
          ))}
        </GameCarousel>
        <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-sm text-white/55">
          More games are in development. Stay tuned.
          <Stickman pose="idle" className="h-5 w-4 text-brand-2/70" stroke={8} />
        </div>
      </section>

      <Promo />
      <Features />
      <HowItWorks price={formatPrice(GAMES[0].priceCents)} />
      <Footer />
    </main>
  );
}
