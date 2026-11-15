"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  slug: string;
  price: string;
  mode: "guest" | "founder" | "friend" | "owner" | "buyer";
  downloadName: string;
  username: string;
};

export default function GameActions({ slug, price, mode, downloadName, username }: Props) {
  const [downloaded, setDownloaded] = useState(false);
  const key = `downloaded-${username}-${slug}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(key) === "1") {
        window.requestAnimationFrame(() => setDownloaded(true));
      }
    } catch {}
  }, [key]);

  function markDownloaded() {
    setDownloaded(true);
    try {
      localStorage.setItem(key, "1");
    } catch {}
  }

  const notice = (
    <div className="min-h-[76px] rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-[13px] leading-relaxed text-white/65">
      {downloaded ? (
        <><b className="text-emerald-300">✓ Downloaded.</b> You can download it again anytime.</>
      ) : (
        <><b className="text-white">Online play is available.</b> Launch from this website to join rooms and submit global rankings. Downloads still work offline.</>
      )}
    </div>
  );

  if (mode === "guest") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/login?next=${encodeURIComponent("/play/" + slug)}`}
            className="btn-primary rounded-xl px-6 py-3 font-extrabold uppercase tracking-wider text-white"
          >
            Log in to play online
          </Link>
          <Link href={`/signup?next=${encodeURIComponent("/play/" + slug)}`} className="btn-ghost rounded-xl px-6 py-3 font-bold">
            Create account
          </Link>
        </div>
        {notice}
      </div>
    );
  }

  if (mode === "buyer" && price !== "FREE") {
    return (
      <div className="space-y-4">
        <Link
          href={`/checkout/${slug}`}
          className="btn-primary inline-block rounded-xl px-7 py-3 font-extrabold uppercase tracking-wider text-white"
        >
          Buy game · {price}
        </Link>
        <div className="min-h-[76px] rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-3.5 text-[13px] leading-relaxed text-yellow-100">
          Purchase this game to unlock online play and downloads.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/play/${slug}`}
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3 font-extrabold uppercase tracking-wider text-white"
        >
          Play Online
        </Link>
        <a
          href={`/api/download/${slug}`}
          download={downloadName}
          onClick={markDownloaded}
          className="btn-ghost inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold"
        >
          {downloaded ? "Download again" : "Download"}
        </a>
      </div>
      {notice}
      <div className="glass rounded-2xl p-5">
        <h4 className="text-sm font-black uppercase tracking-widest text-cyan-300">Online multiplayer</h4>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          Open Play Online, press Online in the game, then create a room or enter a friend&apos;s room code. Global rankings are shown in the same panel.
        </p>
      </div>
    </div>
  );
}
