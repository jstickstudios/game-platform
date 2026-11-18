"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Game } from "@/lib/games";
import { formatPrice } from "@/lib/games";
import { cn } from "@/utils/cn";

export default function Hero({ games }: { games: Game[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = games[active] ?? games[0] ?? null;

  useEffect(() => {
    if (paused || games.length < 2) return;
    const id = window.setInterval(
      () => setActive((value) => (value + 1) % games.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, [paused, games.length]);

  const move = (direction: -1 | 1) => {
    setActive((value) => (value + direction + games.length) % games.length);
  };

  return (
    <section id="discover" className="relative isolate scroll-mt-20 overflow-hidden pt-10 sm:pt-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] overflow-hidden">
        <div className="absolute -left-40 -top-36 h-[560px] w-[560px] rounded-full bg-brand/25 blur-[140px]" />
        <div className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full bg-brand-2/15 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-brand-2 shadow-[0_0_12px_#26bbff]" />
            <span className="text-[11px] font-black uppercase tracking-[0.32em] text-brand-2">JStick Studios · Game store</span>
          </div>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 sm:inline-flex">
            Independent games
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div
            className="group/stage relative min-h-[490px] overflow-hidden rounded-[28px] border border-white/10 bg-[#080d19] shadow-[0_30px_100px_rgba(0,0,0,.55)] sm:min-h-[570px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {current && (
              <>
                <div key={current.slug + "-backdrop"} className="absolute inset-0 animate-[fade-in_.7s_ease_both]">
                  <Image src={`/images/${current.image}`} alt="" fill priority sizes="(min-width:1024px) 1000px, 100vw" className="scale-110 object-cover opacity-25 blur-2xl" />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(38,187,255,.12),transparent_48%),linear-gradient(90deg,rgba(5,7,13,.72)_0%,rgba(5,7,13,.42)_38%,rgba(5,7,13,.08)_78%,transparent_100%)]" />
                <div key={current.slug + "-art"} className="absolute inset-0 w-full animate-[fade-in_.7s_ease_both]">
                  <Image
                    src={`/images/${current.image}`}
                    alt={`${current.title} artwork`}
                    fill
                    priority
                    sizes="(min-width:1024px) 850px, 100vw"
                    className="object-cover object-center opacity-100 transition-transform duration-[1200ms] group-hover/stage:scale-[1.025]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-[#05070d]/45 to-transparent sm:bg-gradient-to-r sm:from-[#05070d]/55 sm:via-[#05070d]/25 sm:to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:max-w-[66%]">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-brand-2 opacity-70" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-brand-2 shadow-[0_0_14px_#26bbff]" />
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-[0.28em] text-brand-2">Featured title</span>
                    <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white/70 backdrop-blur">{current.rating === "E" ? "Everyone" : current.rating === "A" ? "Action" : "18+"}</span>
                  </div>
                  <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[0.96] tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
                    {current.title}
                  </h1>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">{current.tagline}</p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <a href="#games" className="btn-shine inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-2 px-6 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_10px_35px_rgba(0,120,242,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_42px_rgba(38,187,255,.4)]">
                      Explore games <span aria-hidden="true">↗</span>
                    </a>
                    <span className="inline-flex h-12 items-center rounded-xl border border-white/15 bg-black/35 px-5 text-sm font-bold text-white backdrop-blur-xl">{formatPrice(current.priceCents)}</span>
                  </div>
                </div>
                <div className="absolute right-5 top-5 flex gap-2">
                  {games.map((game, index) => (
                    <button key={game.slug} onClick={() => setActive(index)} aria-label={`Show ${game.title}`} aria-pressed={index === active}
                      className={cn("h-1.5 rounded-full transition-all duration-500", index === active ? "w-9 bg-brand-2 shadow-[0_0_12px_#26bbff]" : "w-2 bg-white/40 hover:bg-white/80")} />
                  ))}
                </div>
                <div className="pointer-events-none absolute bottom-5 right-6 hidden text-[10px] font-bold uppercase tracking-[0.25em] text-white/35 sm:block">
                  {String(active + 1).padStart(2, "0")} <span className="text-white/20">/</span> {String(games.length).padStart(2, "0")}
                </div>
              </>
            )}
          </div>

          <aside
            className="flex min-h-[420px] flex-col gap-3 lg:min-h-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-label="Automatically rotating featured games"
          >
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">In the spotlight</span>
              <span className="text-[10px] font-bold text-brand-2">{games.length} TITLES</span>
            </div>

            {current && (
              <div key={current.slug + "-spotlight"} className="group/spotlight relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-brand-2/35 bg-[#0b1220] shadow-[0_18px_55px_rgba(0,0,0,.32)] animate-[fade-in_.55s_ease_both]">
                <a href={`/play/${current.slug}`} className="relative block min-h-[210px] flex-1 overflow-hidden bg-black/50" aria-label={`Play ${current.title}`}>
                  <Image src={`/images/${current.image}`} alt={`${current.title} artwork`} fill sizes="(min-width:1024px) 300px, 100vw" className="object-cover transition-transform duration-700 group-hover/spotlight:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d17] via-transparent to-black/10" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur">Now featuring</span>
                  <span className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">{formatPrice(current.priceCents)}</span>
                </a>

                <div className="p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-2">Featured game</p>
                  <h2 className="mt-2 text-lg font-black leading-tight text-white">{current.title}</h2>
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/50">{current.tagline}</p>
                  <a href={`/api/download/${current.slug}`} className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-brand-2/35 bg-brand/15 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-brand/25">
                    Download this game <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.035] p-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">Auto-next · every 5 sec</span>
              <div className="flex items-center gap-2">
                <span className="mr-1 text-[10px] font-bold tabular-nums text-white/50">{String(active + 1).padStart(2, "0")} / {String(games.length).padStart(2, "0")}</span>
                <button type="button" onClick={() => move(-1)} aria-label="Previous featured game" className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/[0.05] text-white transition hover:border-brand-2/60 hover:bg-brand/20">←</button>
                <button type="button" onClick={() => move(1)} aria-label="Next featured game" className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/[0.05] text-white transition hover:border-brand-2/60 hover:bg-brand/20">→</button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/20 text-xl">⚡</span>
                <div>
                  <p className="text-sm font-extrabold text-white">Straight from the studio</p>
                  <p className="mt-0.5 text-xs text-white/45">Small games. Big energy.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}