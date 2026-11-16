"use client";

import Link from "next/link";

type Props = {
  slug: string;
  price: string;
  mode: "guest" | "founder" | "friend" | "owner" | "buyer";
  downloadName: string;
  username: string;
};

export default function GameActions({ slug, price, mode, downloadName }: Props) {
  const mobilePlay = (
    <Link
      href={`/play/${slug}`}
      className="jstick-mobile-action btn-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 font-extrabold uppercase tracking-wider text-white"
    >
      <span aria-hidden="true">▶</span> Play now
    </Link>
  );

  const desktopDownload = (
    <a
      href={`/api/download/${slug}`}
      download={downloadName}
      className="jstick-desktop-action btn-primary inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-white"
    >
      Download game
    </a>
  );

  if (mode === "guest" && price === "FREE") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {mobilePlay}
        {desktopDownload}
      </div>
    );
  }

  if (mode === "guest") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/login?next=${encodeURIComponent("/play/" + slug)}`}
            className="btn-primary rounded-xl px-6 py-3 font-extrabold uppercase tracking-wider text-white"
          >
            Log in to continue
          </Link>
          <Link href={`/signup?next=${encodeURIComponent("/play/" + slug)}`} className="btn-ghost rounded-xl px-4 py-3 font-bold">
            Create account
          </Link>
        </div>
        <p className="text-xs leading-relaxed text-white/50">This studio release needs an account and purchase before it can be played or downloaded.</p>
      </div>
    );
  }

  if (mode === "buyer" && price !== "FREE") {
    return (
      <div className="space-y-3">
        <Link
          href={`/checkout/${slug}`}
          className="btn-primary inline-flex min-h-11 items-center rounded-xl px-7 py-3 font-extrabold uppercase tracking-wider text-white"
        >
          Unlock game · {price}
        </Link>
        <p className="text-xs text-white/50">Purchase this game to unlock it.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {mobilePlay}
      {desktopDownload}
    </div>
  );
}
