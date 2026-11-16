"use client";
import type { CSSProperties, ReactNode } from "react";
import Reveal from "./components/Reveal";
import SectionHeading from "./components/SectionHeading";
import SpotlightCard from "./components/SpotlightCard";
import StickmanStage from "./components/StickmanStage";

const Arrow = () => (
  <svg viewBox="0 0 24 24" className="arrow h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function Title({ text, start = 0.2 }: { text: string; start?: number }) {
  return (
    <h1 aria-label={text} className="font-display text-[clamp(3.4rem,13vw,9rem)] font-bold leading-[0.95] tracking-tighter">
      {text.split(" ").map((word, wi, arr) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden="true">
          {word.split("").map((c, i) => (
            <span
              key={i}
              className={`char ${wi === arr.length - 1 ? "text-shimmer" : "title-glow"}`}
              style={{ "--d": `${start + (wi * 5 + i) * 0.055}s` } as CSSProperties}
            >
              {c}
            </span>
          ))}
          {wi < arr.length - 1 && "\u00A0"}
        </span>
      ))}
    </h1>
  );
}

const icons: Record<string, ReactNode> = {
  play: <path d="M8 5v14l11-7z" />,
  craft: (
    <>
      <path d="M12 3l2.6 5.6L21 9.5l-4.5 4.3L17.6 20 12 17l-5.6 3 1.1-6.2L3 9.5l6.4-.9z" />
    </>
  ),
  team: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </>
  ),
};

const beliefs = [
  { icon: "play", title: "Play comes first", text: "Every system we build has to earn its place by making the game more fun to play." },
  { icon: "craft", title: "Craft in the details", text: "Animation, sound, and feel are never an afterthought. We polish until it feels right." },
  { icon: "team", title: "Solo creator, clear vision", text: "Fewer people means faster decisions and a game that stays true to its original idea." },
];

const steps = [
  { n: "01", title: "Prototype", text: "I test the core idea early with rough, playable builds." },
  { n: "02", title: "Playtest", text: "I use real feedback to decide what to keep, change, or cut." },
  { n: "03", title: "Polish", text: "I refine visuals, audio, and feel until everything clicks." },
  { n: "04", title: "Release", text: "I release, listen, and keep improving after launch." },
];

export default function OurStudio() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pb-24 pt-32 text-center sm:px-8" aria-labelledby="hero-title">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="beam beam-1" />
          <div className="beam beam-2" />
          <div className="hero-floor" />
          <div className="absolute left-1/2 top-[38%] h-[60vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(47,123,255,0.28),transparent_65%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="enter inline-flex items-center gap-3 rounded-full border border-glow/25 bg-electric/10 px-5 py-2 backdrop-blur" style={{ "--d": "0.05s" } as CSSProperties}>
            <span className="h-1.5 w-1.5 rounded-full bg-glow shadow-[0_0_10px_#2f7bff]" aria-hidden="true" />
            <span className="font-display text-xs font-medium uppercase tracking-[0.32em] text-ice">JStick Studios</span>
          </div>
          <div id="hero-title" className="mt-8" style={{ perspective: 800 }}>
            <Title text="My Studio" />
          </div>
          <p className="enter mx-auto mt-8 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl" style={{ "--d": "1.1s" } as CSSProperties}>
            I am an independent game developer focused on making games that are fun, polished, and made with care.
          </p>
          <p className="enter mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-blue-300/80" style={{ "--d": "1.2s" } as CSSProperties}>Created by JVO</p>
          <p className="hidden" />
          <div className="enter mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ "--d": "1.3s" } as CSSProperties}>
            <button type="button" className="btn btn-primary" onClick={() => scrollTo("who-we-are")}>
              Who I Am <Arrow />
            </button>
            <a href="/store" className="btn btn-ghost">
              Visit the Store <Arrow />
            </a>
          </div>
        </div>

        <div className="enter absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block" style={{ "--d": "1.8s" } as CSSProperties} aria-hidden="true">
          <div className="scroll-cue flex h-10 w-6 justify-center rounded-full border border-white/25 pt-2">
            <span />
          </div>
        </div>
      </section>

      {/* --------------------------- WHO WE ARE --------------------------- */}
      <section id="who-we-are" className="relative scroll-mt-20 px-5 py-24 sm:px-8 lg:py-36" aria-labelledby="who-heading">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/30 to-transparent" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeading eyebrow="Who I Am" id="who-heading">
              <span className="block">Small studio.</span>
              <span className="text-shimmer block pb-1">Big ideas.</span>
            </SectionHeading>
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-300">
                I am an independent game developer. Working solo lets me take ideas quickly from a sketch to something you can play.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
                I care about tight controls, clear visuals, and the small details that make a game feel good in your hands.
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <ul className="mt-9 flex flex-wrap gap-3">
                {["Independent", "Player-first", "Made with care"].map((t) => (
                  <li key={t} className="pill">
                    <i aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal dir="scale" delay={0.1} className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(47,123,255,0.18),transparent_70%)] blur-2xl" aria-hidden="true" />
            <StickmanStage />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- WHAT DRIVES US ---------------------------- */}
      <section className="relative px-5 py-24 sm:px-8 lg:py-32" aria-labelledby="drive-heading">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="What Drives Me" id="drive-heading">
            Built around <span className="text-shimmer">the player</span>
          </SectionHeading>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {beliefs.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.12}>
                <SpotlightCard className="h-full">
                  <span className="icon-chip">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {icons[b.icon]}
                    </svg>
                  </span>
                  <h3 className="mt-7 font-display text-2xl font-semibold tracking-tight text-white">{b.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-400">{b.text}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ HOW WE WORK ------------------------------ */}
      <section className="relative px-5 py-24 sm:px-8 lg:py-32" aria-labelledby="work-heading">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="How I Work" id="work-heading">
            From spark <span className="text-shimmer">to release</span>
          </SectionHeading>
          <Reveal className="relative mt-16">
            <ol className="relative grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <span className="step-line hidden lg:block" aria-hidden="true" />
              {steps.map((s) => (
                <li key={s.n} className="step relative">
                  <span className="step-dot">{s.n}</span>
                  <h3 className="mt-6 font-display text-xl font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-slate-400">{s.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------- CTA -------------------------------- */}
      <section className="relative px-5 py-24 sm:px-8 lg:py-32" aria-labelledby="cta-heading">
        <Reveal dir="scale" className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-glow/20 bg-gradient-to-b from-electric/10 to-white/[0.02] px-6 py-16 text-center shadow-[0_40px_120px_-40px_rgba(47,123,255,0.6)] backdrop-blur sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(47,123,255,0.35),transparent_65%)]" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-glow to-transparent" aria-hidden="true" />
            <h2 id="cta-heading" className="relative font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ready to <span className="text-shimmer">play?</span>
            </h2>
            <p className="relative mx-auto mt-5 max-w-md text-lg text-slate-300">Browse my games in the Store.</p>
            <div className="relative mt-9">
              <a href="/store" className="btn btn-primary">
                Visit the Store <Arrow />
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
