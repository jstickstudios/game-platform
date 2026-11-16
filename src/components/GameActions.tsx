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

  const downloadNotice = (
    <div className="min-h-[76px] rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-[13px] leading-relaxed text-white/65">
      {downloaded ? (
        <><b className="text-emerald-300">✓ Downloaded.</b> Open the HTML file in Chrome to play. You can download it again anytime.</>
      ) : (
        <>This game is <b className="text-white">download-only</b> on JStick Studios. Download the HTML file and open it in Chrome to play.</>
      )}
    </div>
  );

  if (mode === "guest") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/login?next=${encodeURIComponent("/api/download/" + slug)}`}
            className="btn-primary rounded-xl px-6 py-3 font-extrabold uppercase tracking-wider text-white"
          >
            Log in to download
          </Link>
          <Link href={`/signup?next=${encodeURIComponent("/api/download/" + slug)}`} className="btn-ghost rounded-xl px-6 py-3 font-bold">
            Create account
          </Link>
        </div>
        {downloadNotice}
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
          Purchase this game to unlock its download.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <a
        href={`/api/download/${slug}`}
        download={downloadName}
        onClick={markDownloaded}
        className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3 font-extrabold uppercase tracking-wider text-white"
      >
        {downloaded ? "Download again" : "Download game"}
      </a>
      {downloadNotice}
    </div>
  );
}
