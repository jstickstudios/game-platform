"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  slug: string;
  price: string;
  mode: "guest" | "founder" | "owner" | "buyer";
  downloadName: string;
};

export default function GameActions({ slug, price, mode, downloadName }: Props) {
  const [downloaded, setDownloaded] = useState(false);

  if (mode === "guest") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/login?next=${encodeURIComponent("/checkout/" + slug)}`}
          className="btn-primary rounded-xl px-6 py-3 font-extrabold uppercase tracking-wider text-white"
        >
          Log in to {price === "FREE" ? "play" : "buy"} - {price}
        </Link>
        <Link href={`/signup?next=${encodeURIComponent("/checkout/" + slug)}`} className="btn-ghost rounded-xl px-6 py-3 font-bold">
          Create account
        </Link>
      </div>
    );
  }

  if (mode === "buyer") {
    return (
      <Link
        href={price === "FREE" ? `/api/download/${slug}` : `/checkout/${slug}`}
        className="btn-primary inline-block rounded-xl px-7 py-3 font-extrabold uppercase tracking-wider text-white"
      >
        {price === "FREE" ? "Play now" : "Buy now"} - {price}
      </Link>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`/api/download/${slug}`}
          download={downloadName}
          onClick={() => setDownloaded(true)}
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3 font-extrabold uppercase tracking-wider text-white"
        >
          Download{mode === "founder" ? " (free - founder)" : ""}
        </a>
        <span className="text-sm opacity-70">
          {mode === "founder" ? "Founder account: all games are free." : "You own this game."}
        </span>
      </div>

      <div className={`glass rounded-2xl p-5 transition ${downloaded ? "ring-2 ring-cyan-400/60" : ""}`}>
        <h4 className="text-sm font-black uppercase tracking-widest text-cyan-300">
          How to play
        </h4>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm opacity-75">
          <li>Click <b>Download</b> - the game saves to your Downloads folder.</li>
          <li>Double-click the downloaded file - the game opens in your browser.</li>
          <li>Press <b>F</b> in the game for fullscreen. Have fun!</li>
        </ol>
      </div>
    </div>
  );
}
