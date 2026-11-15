import Reveal from "./Reveal";
import Stickman from "./Stickman";

/* ───────── Marquee ───────── */
export function Marquee() {
  const words = ["Stickman", "Parkour", "Action", "Runner", "Free to play", "Browser games"];
  const row = [...words, ...words];
  return (
    <div className="relative mt-14 overflow-hidden border-y border-white/5 bg-white/[0.02] py-5">
      <div className="flex w-max items-center gap-10" style={{ animation: "marquee 32s linear infinite" }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center gap-10">
            {row.map((w, i) => (
              <div key={`${k}-${i}`} className="flex items-center gap-10">
                <span
                  className="text-4xl font-black uppercase tracking-tight text-transparent sm:text-5xl"
                  style={{ WebkitTextStroke: "1.5px rgba(255,255,255,.28)" }}
                >
                  {w}
                </span>
                <Stickman pose="run" className="h-9 w-8 text-brand-2/80" stroke={8} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}

/* ───────── Promo banner ───────── */
export function Promo() {
  return (
    <div className="mx-auto mt-16 w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
      <Reveal>
        <div className="group relative overflow-hidden rounded-[32px] ring-1 ring-white/10">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(115deg,#0057c2,#0078f2 35%,#26bbff 70%,#0057c2)",
              backgroundSize: "250% 100%",
              animation: "gradient-pan 10s linear infinite",
            }}
          />
          <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur">
                🎁 Always free
              </span>
              <h2 className="mt-5 text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">
                Jump in.
                <br />
                No limits.
              </h2>
              <p className="mt-5 max-w-md text-white/80">
                Every JStick game runs in your browser. Download, open it in Chrome, and start playing in seconds.
              </p>
              <a
                href="#games"
                className="btn-shine mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-extrabold uppercase tracking-wider text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(0,0,0,.3)] active:scale-95"
              >
                Browse games
              </a>
            </div>

            {/* Mini action sequence: sprint → vault → slide → sword-swipe → wall flip. */}
            <div className="promo-arena relative mx-auto h-60 w-full max-w-md overflow-hidden rounded-2xl sm:h-72">
              <div className="promo-sun absolute right-[12%] top-[12%] h-24 w-24 rounded-full bg-white/20 blur-2xl" />
              <div className="promo-speedlines absolute inset-0" />
              <div className="promo-roof absolute inset-x-0 bottom-6 h-[3px] rounded-full bg-white/70" />
              <div className="promo-floor-glow absolute inset-x-0 bottom-5 h-12" />
              <div className="promo-obstacle promo-crate absolute bottom-7 left-[29%] h-10 w-12 rounded-md border-2 border-white/70 bg-slate-950/35 sm:h-12 sm:w-14">
                <span className="absolute inset-1 border border-white/30" />
              </div>
              <div className="promo-obstacle promo-wall absolute bottom-7 right-[7%] h-28 w-5 rounded-t-md border border-white/60 bg-slate-950/30 sm:h-36" />
              <div className="promo-dummy absolute bottom-7 right-[22%]">
                <Stickman pose="idle" className="h-24 w-20 text-white/50 sm:h-28 sm:w-24" stroke={5} />
              </div>
              <div className="promo-ninja absolute bottom-7 left-0 z-10">
                <div className="promo-ninja-motion relative h-36 w-28 sm:h-44 sm:w-36">
                  <Stickman pose="run" className="promo-run-pose absolute inset-0 h-full w-full text-white" stroke={5} />
                  <Stickman pose="jump" className="promo-jump-pose absolute inset-0 h-full w-full text-white" stroke={5} />
                  <Stickman pose="run" className="promo-slide-pose absolute inset-0 h-full w-full text-white" stroke={5} />
                  <div className="promo-blade absolute left-[58%] top-[37%] h-1 w-20 origin-left rounded-full bg-white shadow-[0_0_12px_3px_rgba(255,255,255,.9)]" />
                  <div className="promo-slash absolute left-[42%] top-[8%] h-24 w-24 rounded-full border-[3px] border-transparent border-r-white border-t-white" />
                  <div className="promo-spark absolute left-[76%] top-[36%] h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="promo-impact absolute bottom-8 right-[19%] h-12 w-12 rounded-full border-2 border-white/80" />
              <div className="promo-dust absolute bottom-7 left-[40%] h-3 w-3 rounded-full bg-white/70 blur-[2px]" />
              <div className="promo-dust promo-dust-2 absolute bottom-6 left-[46%] h-2 w-2 rounded-full bg-white/50 blur-[2px]" />
              <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-white/75 backdrop-blur">
                Action in motion
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ───────── Feature tiles ───────── */
export function Features() {
  const items = [
    { icon: "⚡", title: "Instant play", text: "Download and you're in. Zero waiting around." },
    { icon: "🌐", title: "Play anywhere", text: "Desktop, tablet or phone — it just works." },
    { icon: "✨", title: "Fresh drops", text: "New stickman games added all the time." },
    { icon: "🎁", title: "Free forever", text: "No paywalls, no subscriptions, no catch." },
  ];
  return (
    <div className="mx-auto mt-16 w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 90}>
            <div className="group h-full rounded-3xl bg-panel p-6 ring-1 ring-white/5 transition-all duration-500 hover:-translate-y-2 hover:bg-panel-2 hover:ring-brand-2/40 hover:shadow-[0_20px_60px_rgba(0,120,242,.18)]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-2xl transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-brand">
                {it.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">{it.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ───────── How it works ───────── */
export function HowItWorks({ price }: { price: string }) {
  const items = [
    ["1", "Create an account", "Sign up with a username, email and password."],
    ["2", "Buy the game", `${price}. Approve the agreements and pay by card or connect your bank on a secure page.`],
    ["3", "Download it", "Games must be downloaded before you can play them."],
    ["4", "Run it in Chrome", "Double-click the downloaded file and open it in Chrome — run, jump, slide, die."],
  ];
  return (
    <div id="how" className="mx-auto mt-20 w-full max-w-[1400px] scroll-mt-24 px-4 sm:px-6 lg:px-10">
      <Reveal>
        <h2 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-[28px]">How it works</h2>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-4">
        {items.map(([n, t, d], i) => (
          <Reveal key={n} delay={i * 90}>
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 font-black text-black">{n}</div>
              <h3 className="font-extrabold">{t}</h3>
              <p className="mt-1 text-sm opacity-70">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ───────── Footer ───────── */
export function Footer() {
  return (
    <footer className="relative mt-28 overflow-hidden border-t border-white/5 bg-[#0b0b0e]">
      <div className="pointer-events-none absolute inset-x-0 -bottom-10 select-none text-center text-[22vw] font-black leading-none tracking-tighter text-white/[0.025]">
        JSTICK
      </div>
      <div className="relative mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2">
                <Stickman pose="run" className="h-6 w-5 text-white" stroke={9} />
              </span>
              <span className="text-lg font-black tracking-[0.14em]">
                JStick <span className="text-brand-2">Studios</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              Fast, stylish stickman games. Every game carries its own content rating badge.
            </p>
          </div>
          {[
            { h: "Store", l: ["Discover", "New releases", "Top charts"] },
            { h: "Genres", l: ["Action", "Parkour", "Runner"] },
            { h: "Support", l: ["Help center", "Contact", "Privacy", "Terms"] },
          ].map((c) => (
            <div key={c.h}>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{c.h}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.l.map((x) => (
                  <li key={x}>
                    <a href="#games" className="text-sm text-white/45 transition-all duration-300 hover:pl-1 hover:text-white">
                      {x}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} JStick Studios. All rights reserved.</span>
          <span>Payments are handled by a secure payment provider — JStick Studios never sees or stores your card or bank details.</span>
        </div>
      </div>
    </footer>
  );
}
