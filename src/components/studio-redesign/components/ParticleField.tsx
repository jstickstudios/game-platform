"use client";
import { useEffect, useRef } from "react";

type P = { x: number; y: number; r: number; vy: number; vx: number; a: number; ph: number; blue: boolean };

/** Fixed, low-cost ambient background: soft light blobs + drifting dust particles. */
export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let parts: P[] = [];
    let raf = 0;
    let last = 0;

    const make = (initial: boolean): P => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 0.5 + Math.random() * 1.5,
      vy: 0.01 + Math.random() * 0.03,
      vx: (Math.random() - 0.5) * 0.012,
      a: 0.25 + Math.random() * 0.55,
      ph: Math.random() * Math.PI * 2,
      blue: Math.random() > 0.45,
    });

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(70, Math.round((w * h) / 24000)));
      parts = Array.from({ length: count }, () => make(true));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        const tw = 0.6 + 0.4 * Math.sin(t * 0.0012 + p.ph);
        const alpha = p.a * tw;
        ctx.fillStyle = p.blue ? `rgba(90,160,255,${alpha})` : `rgba(225,238,255,${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.blue && p.r > 1.1) {
          ctx.fillStyle = `rgba(47,123,255,${alpha * 0.18})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const tick = (t: number) => {
      const dt = Math.min(t - last, 50);
      last = t;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.y -= p.vy * dt;
        p.x += p.vx * dt + Math.sin(t * 0.0004 + p.ph) * 0.05;
        if (p.y < -10) parts[i] = make(false);
      }
      draw(t);
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    if (reduce) draw(0);
    else raf = requestAnimationFrame(tick);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="ambient-blob blob-a" />
      <div className="ambient-blob blob-b" />
      <div className="ambient-blob blob-c" />
      <canvas ref={ref} className="absolute inset-0" />
      <div className="film-grain" />
      <div className="vignette" />
    </div>
  );
}
