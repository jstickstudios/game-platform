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
  const [copied, setCopied] = useState<string | null>(null);

  const chromeCmd = `Start-Process chrome -ArgumentList "--new-window","--start-fullscreen","--app=file:///$($env:USERPROFILE.Replace('\\','/'))/Downloads/${downloadName}"`;
  const fallbackCmd = `& "$env:ProgramFiles\\Google\\Chrome\\Application\\chrome.exe" --new-window --start-fullscreen "--app=file:///$($env:USERPROFILE.Replace('\\','/'))/Downloads/${downloadName}"`;

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  }

  if (mode === "guest") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/login?next=${encodeURIComponent("/checkout/" + slug)}`}
          className="btn-primary rounded-xl px-6 py-3 font-extrabold uppercase tracking-wider text-white"
        >
          Log in to buy · {price}
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
        href={`/checkout/${slug}`}
        className="btn-primary inline-block rounded-xl px-7 py-3 font-extrabold uppercase tracking-wider text-white"
      >
        Buy now · {price}
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
          ⬇ Download{mode === "founder" ? " (free — founder)" : ""}
        </a>
        <span className="text-sm opacity-70">
          {mode === "founder" ? "Founder account: all games are free." : "You own this game."}
        </span>
      </div>

      <div className={`glass rounded-2xl p-5 transition ${downloaded ? "ring-2 ring-cyan-400/60" : ""}`}>
        <h4 className="text-sm font-black uppercase tracking-widest text-cyan-300">
          Run it in Google Chrome (Windows PowerShell)
        </h4>
        <p className="mt-2 text-sm opacity-75">
          1. Download the game (it saves to your <b>Downloads</b> folder). 2. Open PowerShell. 3. Paste this and press Enter:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-black/60 p-3 text-xs leading-relaxed text-emerald-300">
          {chromeCmd}
        </pre>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={() => copy(chromeCmd, "a")} className="btn-ghost rounded-lg px-3 py-1.5 text-xs font-bold">
            {copied === "a" ? "Copied ✓" : "Copy command"}
          </button>
          <button onClick={() => copy(fallbackCmd, "b")} className="btn-ghost rounded-lg px-3 py-1.5 text-xs font-bold">
            {copied === "b" ? "Copied ✓" : "Copy fallback (full Chrome path)"}
          </button>
        </div>
        <p className="mt-3 text-xs opacity-60">
          If Chrome isn&apos;t found, use the fallback. You can also just double-click the file and open it with Chrome. Press <b>F</b> in the game for fullscreen.
        </p>
      </div>
    </div>
  );
}
