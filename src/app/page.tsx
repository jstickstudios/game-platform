import type { Metadata } from "next";
import Nav from "@/components/Nav";
import GameCard from "@/components/GameCard";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import Stickman from "@/components/Stickman";
import { Features, Footer, Marquee, Promo } from "@/components/Sections";
import { GAMES } from "@/lib/games";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Independent Games. Big Energy.",
  description: "Discover original indie games from JStick Studios — action, racing, parkour and more.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <Nav />
      <Hero games={GAMES} />
      <Marquee />

      <section
        id="games"
        className="mx-auto mt-16 w-full max-w-[1400px] scroll-mt-24 px-4 sm:px-6 lg:px-10"
      >
        <Reveal>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-2">
                Made at JStick
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Games worth coming back to.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
                Meet the current lineup. Every title is built to bring its own
                world, challenge and style.
              </p>
            </div>
            <Link
              href="/store"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-brand-2/60 hover:bg-brand/10"
            >
              Visit the store <span className="ml-2" aria-hidden="true">↗</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {GAMES.map((game, index) => (
            <Reveal key={game.slug} delay={index * 75}>
              <GameCard game={game} />
            </Reveal>
          ))}
        </div>
        <div className="mt-7 flex items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center text-sm text-white/50">
          More games are in development. The next release is always around the corner.
          <Stickman pose="idle" className="h-5 w-4 text-brand-2/70" stroke={8} />
        </div>
      </section>

      <Promo />
      <Features />

      <section className="mx-auto mt-20 w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#101722] p-7 sm:p-10 lg:p-14">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-brand/20 blur-[100px]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-2">Behind the games</p>
            <div className="mt-3 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Small studio. Big games.</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
                  We are an independent studio focused on making memorable games,
                  experimenting with new ideas and giving every release its own identity.
                </p>
              </div>
              <Link
                href="/studio"
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-xs font-black uppercase tracking-[0.15em] text-black transition hover:-translate-y-0.5 hover:bg-brand-2"
              >
                Meet the studio <span className="ml-2" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
