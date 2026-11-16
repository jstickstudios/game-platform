"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function GamePlayer({ slug, title }: { slug: string; title: string }) {
  const shell = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function toggleFullscreen() {
    if (fullscreen) {
      setFullscreen(false);
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // The CSS fullscreen view still exits even if the browser API rejects.
        }
      }
      return;
    }

    // CSS fullscreen is the reliable fallback for iPhone/iPad browsers,
    // which often do not implement the Fullscreen API for normal web pages.
    setFullscreen(true);

    try {
      if (shell.current?.requestFullscreen) {
        await shell.current.requestFullscreen();
      }
    } catch {
      // Keep the immersive CSS view active when native fullscreen is blocked.
    }
  }

  return (
    <main
      ref={shell}
      className={`game-player-shell fixed inset-0 z-[100] flex min-h-0 flex-col bg-[#05060b] text-white ${fullscreen ? "is-immersive" : ""}`}
    >
      <header className="game-player-bar flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0b0d14] px-3 sm:px-5">
        <Link
          href="/store#games"
          className="player-back inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-xs font-bold text-white/85 transition hover:bg-white/10"
        >
          <span aria-hidden="true">←</span>
          <span>GAMES</span>
        </Link>
        <h1 className="player-title min-w-0 flex-1 truncate text-center text-xs font-black uppercase tracking-[0.14em] sm:text-sm">
          {title}
        </h1>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="player-fullscreen min-h-10 shrink-0 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-[10px] font-black tracking-wider text-white/90 transition hover:bg-white/10"
        >
          {fullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
        </button>
      </header>
      <iframe
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
