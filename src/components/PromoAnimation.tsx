"use client";

import { useEffect, useRef, useState } from "react";
import { H, Scene, W } from "./promo-animation/engine/fx";
import { ParkourScene } from "./promo-animation/scenes/parkour";
import { SwordScene } from "./promo-animation/scenes/sword";
import { CombatScene } from "./promo-animation/scenes/combat";

const SCENE_NAMES = ["PARKOUR", "SWORD FIGHTING", "HAND-TO-HAND COMBAT"];
const SCENE_COLORS = ["#2ef2ff", "#ff4d6d", "#ffb02e"];

export default function PromoAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneLabel, setSceneLabel] = useState(SCENE_NAMES[0]);
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !wrap || !ctx) return;

    const scenes: Scene[] = [new ParkourScene(), new SwordScene(), new CombatScene()];
    let active = 0;
    let previousProgress = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    let fade = 0;
    let switching = false;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
    }, { threshold: 0.05 });
    visibilityObserver.observe(wrap);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.min(0.035, Math.max(0, (now - last) / 1000));
      last = now;

      if (!reducedMotion.matches) {
        const scene = scenes[active];
        scene.update(dt);
        const progress = scene.progress;
        const ended = (progress < previousProgress && previousProgress > 0.9) || progress >= 0.999;
        if (ended && !switching) {
          switching = true;
          fade = 0;
        }
        previousProgress = progress;
        if (switching) {
          fade = Math.min(1, fade + dt * 3.5);
          if (fade >= 1) {
            active = (active + 1) % scenes.length;
            scenes[active].reset();
            previousProgress = 0;
            setSceneIndex(active);
            setSceneLabel(SCENE_NAMES[active]);
            switching = false;
          }
        }
      }

      const sx = canvas.width / W;
      const sy = canvas.height / H;
      ctx.setTransform(sx, 0, 0, sy, 0, 0);
      ctx.clearRect(0, 0, W, H);
      scenes[active].draw(ctx);
      if (switching) {
        ctx.fillStyle = `rgba(3, 5, 14, ${Math.min(0.92, fade * 0.92)})`;
        ctx.fillRect(0, 0, W, H);
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <div className="group relative mx-auto aspect-video w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-[#050711] shadow-[0_24px_80px_rgba(0,0,0,.4)]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-label="Animated stickman parkour, sword fighting and hand-to-hand combat showcase"
        role="img"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25" />
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[9px] font-black tracking-[0.2em] text-white/90 backdrop-blur-md">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: SCENE_COLORS[sceneIndex], boxShadow: `0 0 12px ${SCENE_COLORS[sceneIndex]}` }} />
        JSTICK MOTION SHOWCASE
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[9px] font-black tracking-[0.2em] text-white backdrop-blur-md">
        {sceneLabel}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
        <div className="h-full w-1/3 transition-[margin] duration-500" style={{ marginLeft: `${sceneIndex * 33.333}%`, backgroundColor: SCENE_COLORS[sceneIndex], boxShadow: `0 0 12px ${SCENE_COLORS[sceneIndex]}` }} />
      </div>
    </div>
  );
}
