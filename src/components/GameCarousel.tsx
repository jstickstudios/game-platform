"use client";

import { useRef } from "react";

export default function GameCarousel({ children }: { children: React.ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    if (!rail.current) return;
    rail.current.scrollBy({
      left: direction * Math.max(rail.current.clientWidth * 0.82, 320),
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div className="mb-3 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Scroll games left"
          onClick={() => move(-1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-lg text-white/75 transition hover:border-brand-2/60 hover:bg-brand-2/10 hover:text-white"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Scroll games right"
          onClick={() => move(1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-lg text-white/75 transition hover:border-brand-2/60 hover:bg-brand-2/10 hover:text-white"
        >
          →
        </button>
      </div>
      <div
        ref={rail}
        onWheel={(event) => {
          const el = rail.current;
          if (!el || el.scrollWidth <= el.clientWidth) return;
          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.preventDefault();
            el.scrollBy({ left: event.deltaY, behavior: "auto" });
          }
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-5 [scrollbar-color:rgba(38,187,255,.45)_rgba(255,255,255,.06)] [scrollbar-width:thin]"
      >
        {children}
      </div>
    </div>
  );
}
