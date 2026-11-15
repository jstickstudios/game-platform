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

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % Math.max(games.length, 1)), 7000);
    return () => clearInterval(id);
  }, [paused, games.length]);

  const current = games[active] ?? null;

  return (
    <section id="discover" className="relative scroll-mt-20 pt-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[620px] w-[620px] rounded-full opacity-40 blur-[120px]"
          style={{ background: "hsl(190 100% 50%)", animation: "blob-a 14s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-40 top-20 h-[560px] w-[560px] rounded-full opacity-30 blur-[120px]"
          style={{ background: "hsl(340 100% 55%)", animation: "blob-b 17s ease-in-out infinite" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_310px]">
          {/* Featured stage */}
          <div
            className="group/stage relative h-[470px] overflow-hidden rounded-3xl bg-panel ring-1 ring-white/10 shadow-[0_30px_80px_rgba(0,0,0,.55)] sm:h-[540px] lg:h-[600px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div key={active} className="absolute inset-0 anim-fade-in">
              {current && (
                <Image
                  src="/images/neon-stickman-poster.jpg"
                  alt={current.title}
                  fill
                  priority
                  sizes="(min-width:1024px) 900px, 100vw"
                  className="object-contain"
                />
              )}
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            <div key={`t-${active}`} className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <div className="anim-fade-up flex items-center gap-3" style={{ animationDelay: "60ms" }}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inset-0 rounded-full bg-brand-2" style={{ animation: "ping-ring 1.8s ease-out infinite" }} />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-brand-2" />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">Featured game</span>
              </div>

              <h1
                className="anim-fade-up mt-3 max-w-2xl text-[40px] font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
                style={{ animationDelay: "140ms" }}
              >
                {current ? current.title : "JStick Studios"}
              </h1>

              <p className="anim-fade-up mt-4 max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-base" style={{ animationDelay: "220ms" }}>
                {current ? current.tagline : "Fast, stylish stickman games — from chill parkour to intense action."}
              </p>

              <div className="anim-fade-up mt-6 flex flex-wrap items-center gap-3" style={{ animationDelay: "300ms" }}>
                <a
                  href="#games"
                  className="btn-shine flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-extrabold uppercase tracking-wider text-black shadow-[0_10px_40px_rgba(255,255,255,.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_50px_rgba(38,187,255,.45)] active:scale-95"
                >
                  Play now
                </a>
                {current && (
                  <span className="flex h-12 items-center rounded-full bg-white/15 px-6 text-sm font-bold backdrop-blur-md">
                    {formatPrice(current.priceCents)}
                  </span>
                )}
              </div>
            </div>

            <div className="absolute right-5 top-5 flex gap-1.5 lg:hidden">
              {games.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full bg-white transition-all duration-500",
                    i === active ? "w-7" : "w-1.5 opacity-40",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Slide list */}
          <div className="hidden flex-col gap-2 lg:flex">
            {games.map((g, i) => (
              <button
                key={g.slug}
                onClick={() => setActive(i)}
                className={cn(
                  "group/item relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl p-3 text-left transition-all duration-500",
                  i === active ? "bg-white/[0.12] shadow-[0_10px_40px_rgba(0,0,0,.4)]" : "hover:bg-white/[0.06]",
                )}
              >
                <div
                  className="relative grid h-[68px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-xl ring-1 ring-white/10"
                  style={{ background: "linear-gradient(160deg, hsl(190 80% 40%), hsl(190 40% 12%))" }}
                >
                  <Stickman pose={i === active ? "run" : "idle"} className="h-8 w-7 text-white/80" stroke={8} />
                </div>
                <div className="min-w-0">
                  <p className={cn("truncate text-sm font-bold transition-colors", i === active ? "text-white" : "text-white/70")}>
                    {g.title}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">
                    {g.rating === "18+" ? "Action · 18+ Gore" : g.rating === "A" ? "Action rated" : "Everyone"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
