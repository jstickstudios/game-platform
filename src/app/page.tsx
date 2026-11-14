import Image from "next/image";
import Nav from "@/components/Nav";
import GameActions from "@/components/GameActions";
import { getUser, hasAccess } from "@/lib/auth";
import { GAMES, formatPrice } from "@/lib/games";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; game?: string }>;
}) {
  const sp = await searchParams;
  const user = await getUser();
  const game = GAMES[0];
  const owned = await hasAccess(user, game.slug);
  const mode = !user ? "guest" : user.isFounder ? "founder" : owned ? "owner" : "buyer";

  return (
    <div className="grid-bg min-h-screen">
      <Nav />

      {sp.payment === "success" && (
        <div className="bg-emerald-500/15 px-5 py-3 text-center text-sm font-semibold text-emerald-200">
          ✓ Payment complete — your game is unlocked. Download it below!
        </div>
      )}
      {sp.payment === "failed" && (
        <div className="bg-red-500/15 px-5 py-3 text-center text-sm font-semibold text-red-200">
          The payment could not be confirmed. You were not charged for an unlocked game — try again.
        </div>
      )}

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-16 text-center">
        <div className="gore-badge rise mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/60 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          🎮 Fast stickman games · rated per game
        </div>
        <h1 className="rise text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
          <span className="neon-text">JStick</span> <span className="blood-text">Studios</span>
        </h1>
        <div className="relative mx-auto h-10 w-64">
          {[8, 24, 44, 62, 80, 92].map((l, i) => (
            <span
              key={l}
              className="drip"
              style={{ left: `${l}%`, ["--h" as string]: `${14 + (i % 3) * 10}px`, ["--d" as string]: `${2.4 + i * 0.5}s`, animationDelay: `${-i * 0.7}s` }}
            />
          ))}
        </div>
        <p className="rise mx-auto mt-2 max-w-2xl text-lg opacity-80">
          We make fast, stylish stickman games — from chill parkour to intense action. <b>Every game carries its own content rating:</b> 🟢 E · Everyone · 🟡 A · Action · 🔴 18+ · Gore
        </p>
      </section>

      {/* GAMES */}
      <section id="games" className="mx-auto max-w-6xl px-5 py-8">
        <h2 className="mb-5 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Our games</h2>
        <article className="glass overflow-hidden rounded-3xl lg:grid lg:grid-cols-2">
          <div className="relative min-h-[340px] bg-black">
            <Image
              src="/images/neon-stickman-poster.jpg"
              alt="Neon Stickman — Rooftop Parkour key art"
              fill
              priority
              sizes="(min-width:1024px) 600px, 100vw"
              className="object-contain"
            />
            <span className={`absolute left-4 top-4 rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-widest ${game.rating === "E" ? "bg-emerald-600" : game.rating === "A" ? "bg-yellow-600" : "bg-red-600"}`}>
              {game.rating === "E" ? "E · Everyone" : game.rating === "A" ? "A · Action" : "18+ · Gore"}
            </span>
            <span className="absolute bottom-4 left-4 rounded-md bg-black/70 px-3 py-1.5 text-lg font-black">
              {formatPrice(game.priceCents)}
            </span>
          </div>
          <div className="space-y-7 p-8 sm:p-10">
            <div>
              <h3 className="text-3xl font-black leading-tight">{game.title}</h3>
              <p className="mt-3 max-w-xl leading-relaxed opacity-80">{game.tagline}</p>
            </div>
            <ul className="grid gap-x-4 gap-y-2.5 text-[13px] leading-relaxed sm:grid-cols-2">
              {[
                "You run it yourself — full manual control",
                "Slide, wall-jump, variable jump height",
                "New random map every time you die",
                "Day & night cycle with sun, moon & stars",
                "Ragdoll gore: blood, chunks & dismemberment",
                "Main menu, settings, controls & fullscreen",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-pink-400">▸</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-3.5 text-[13px] leading-relaxed text-yellow-100">
              <b>Download required.</b> This game can&apos;t be played on the website — download it first, then open it in Chrome.
            </div>
            <GameActions
              slug={game.slug}
              price={formatPrice(game.priceCents)}
              mode={mode}
              downloadName={game.downloadName}
            />
          </div>
        </article>

        <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-6 text-center opacity-70">
          More games are in the works. Stay tuned.
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="mb-6 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">How it works</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["1", "Create an account", "Sign up with a username, email and password."],
            ["2", "Buy the game", `${formatPrice(game.priceCents)}. Approve the agreements and pay by card or connect your bank on a secure page.`],
            ["3", "Download it", "Games must be downloaded before you can play them."],
            ["4", "Run it in Chrome", "Paste the PowerShell command we show you — and run, jump, slide, die."],
          ].map(([n, t, d]) => (
            <div key={n} className="glass rounded-2xl p-5">
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 font-black text-black">{n}</div>
              <h3 className="font-extrabold">{t}</h3>
              <p className="mt-1 text-sm opacity-70">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs opacity-60">
        © {new Date().getFullYear()} JStick Studios · Every game carries its own content rating badge.
        <br />
        Payments are handled by a secure payment provider — JStick Studios never sees or stores your card or bank details.
      </footer>
    </div>
  );
}
