"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function GamePlayer({ slug, title }: { slug: string; title: string }) {
  const shell = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      // Try the player shell first so the game controls remain available.
      if (shell.current?.requestFullscreen) {
        try {
          await shell.current.requestFullscreen();
          return;
        } catch {
          // Some mobile browsers reject fullscreen on a regular page element.
        }
      }

      // Some browsers allow fullscreen on the embedded game even when the
      // surrounding page cannot enter fullscreen.
      if (frame.current?.requestFullscreen) {
        await frame.current.requestFullscreen();
        return;
      }

      // Last standards-based attempt for browsers with limited element support.
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen is not supported by this browser:", error);
    }
  }

  return (
    <main ref={shell} className="game-player-shell fixed inset-0 z-[100] flex min-h-0 flex-col bg-[#05060b] text-white">
      <header className="game-player-bar flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0b0d14] px-3 sm:px-5">
        <Link
          href="/store#games"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-xs font-bold text-white/85 transition hover:bg-white/10"
        >
          <span aria-hidden="true">←</span>
          <span>GAMES</span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-center text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
          {title}
        </h1>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="min-h-10 shrink-0 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-[10px] font-black tracking-wider text-white/90 transition hover:bg-white/10"
        >
          {fullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
        </button>
      </header>
      <iframe
        ref={frame}
        title={title}
        src={`/api/play/${slug}`}
        className="game-player-frame min-h-0 w-full flex-1 border-0 bg-black"
        allow="fullscreen; gamepad"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
