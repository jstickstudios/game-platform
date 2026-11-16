"use client";

import { useEffect, useRef } from "react";
import { GlowEngine } from "./intro/glbg";

function AnimatedBackground() {
  const host = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLCanvasElement>(null);
  const particles = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!host.current || !glow.current || !particles.current) return;
    const engine = new GlowEngine(glow.current, particles.current, host.current);
    return () => engine.destroy();
  }, []);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden bg-black"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 55% at 50% 105%, rgba(0,40,130,0.55), rgba(0,0,0,0) 70%)",
      }}
    >
      <canvas ref={glow} className="absolute inset-0 h-full w-full" />
      <canvas
        ref={particles}
        className="absolute inset-0 h-full w-full"
        style={{ mixBlendMode: "screen" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/80 to-transparent" />
    </div>
  );
}

export default function IntroScreen() {
  return (
    <section
      aria-label="Welcome to JStick Studios"
      className="relative isolate flex min-h-[calc(100svh-65px)] overflow-hidden border-b border-white/5 bg-black"
    >
      <AnimatedBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.5em] text-blue-400 sm:text-sm">
          Enter the universe
        </p>

        <h1
          className="max-w-5xl text-5xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl md:text-8xl"
          style={{ textShadow: "0 0 40px rgba(0,0,0,0.8), 0 2px 0 rgba(0,0,0,0.6)" }}
        >
          JStick Studios
        </h1>

        <p
          className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
          style={{ textShadow: "0 0 20px rgba(0,0,0,0.9)" }}
        >
          We build immersive worlds, relentless action and games that stay with you long
          after the screen goes dark.
        </p>

        <div className="mt-10 flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
          <a
            href="#games"
            className="rounded-sm bg-blue-600 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(30,100,255,0.45)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_0_42px_rgba(30,100,255,0.6)] active:translate-y-0"
          >
            Explore Games
          </a>
          <a
            href="#how"
            className="rounded-sm border border-white/25 bg-black/30 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition duration-300 hover:border-blue-500 hover:text-blue-300"
          >
            Our Studio
          </a>
        </div>
      </div>
    </section>
  );
}
