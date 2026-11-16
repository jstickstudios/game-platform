"use client";

import { useRef } from "react";

export default function GameCarousel({ children }: { children: React.ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);

  function move(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.round(rail.clientWidth * 0.82),
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous games"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-lg text-white transition hover:border-brand-2/60 hover:bg-brand-2/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-2"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next games"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-lg text-white transition hover:border-brand-2/60 hover:bg-brand-2/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-2"
        >
          →
        </button>
      </div>
      <div
        ref={railRef}
        className="game-collection-rail flex gap-5 overflow-x-hidden scroll-smooth"
        aria-label="Game collection"
      >
        {children}
      </div>
    </div>
  );
}
