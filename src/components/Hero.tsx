"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Game } from "@/lib/games";
import { formatPrice } from "@/lib/games";
import { cn } from "@/utils/cn";
import Stickman from "./Stickman";

export default function Hero({ games }: { games: Game[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = games[active] ?? games[0] ?? null;

  useEffect(() => {
    if (paused || games.length < 2) return;
    const id = setInterval(() => setActive((value) => (value + 1) % games.length), 7000);
    return () => clearInterval(id);
  }, [paused, games.length]);

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
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(38,187,255,.18),transparent_42%),linear-gradient(90deg,#05070d_0%,rgba(5,7,13,.88)_34%,rgba(5,7,13,.25)_100%)]" />
                <div key={current.slug + "-art"} className="absolute inset-y-0 right-0 w-full animate-[fade-in_.7s_ease_both] sm:w-[74%]">
                  <Image
                    src={`/images/${current.image}`}
                    alt={`${current.title} artwork`}
                    fill
                    priority
                    sizes="(min-width:1024px) 850px, 100vw"
                    className="object-cover object-center opacity-90 transition-transform duration-[1200ms] group-hover/stage:scale-[1.025] sm:object-[70%_center]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-[#05070d]/45 to-transparent sm:bg-gradient-to-r sm:from-[#05070d] sm:via-[#05070d]/75 sm:to-transparent" />
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
                  0{active + 1} <span className="text-white/20">/</span> 0{games.length}
                </div>
              </>
            )}
          </div>

          <aside className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">In the spotlight</span>
              <span className="text-[10px] font-bold text-brand-2">{games.length} TITLES</span>
            </div>
            {games.map((game, index) => (
              <button key={game.slug} onClick={() => setActive(index)} aria-pressed={index === active}
                className={cn("group/item relative flex min-h-[112px] flex-1 items-center gap-4 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300",
                  index === active ? "border-brand-2/55 bg-brand/15 shadow-[0_12px_35px_rgba(0,120,242,.16)]" : "border-white/[0.08] bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]")}>
                <span className="relative h-[82px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-black/50">
                  <Image src={`/images/${game.image}`} alt="" fill sizes="68px" className="object-cover object-center transition-transform duration-500 group-hover/item:scale-110" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-2">{index === active ? "Now featured" : "Discover"}</span>
                  <span className="mt-1 block text-sm font-extrabold leading-snug text-white">{game.title}</span>
                  <span className="mt-2 block text-xs font-bold text-white/45">{formatPrice(game.priceCents)}</span>
                </span>
                <span className="pr-2 text-lg text-white/25 transition-all group-hover/item:translate-x-1 group-hover/item:text-brand-2">→</span>
              </button>
            ))}
            <div className="mt-auto rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5">
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
