import Link from "next/link";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import Stickman from "@/components/Stickman";
import { Features, Footer } from "@/components/Sections";

export default function StudioPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <section className="relative isolate flex min-h-[72vh] items-center overflow-hidden border-b border-white/5 px-6 py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,95,220,.24),transparent_60%)]" />
        <div className="mx-auto w-full max-w-[1200px]">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-blue-400">Behind the games</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase leading-[.95] tracking-tight sm:text-7xl md:text-8xl">
              Our Studio<span className="text-blue-500">.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/60">
              JStick Studios is an independent game studio creating fast, stylish stickman games.
              We focus on responsive controls, satisfying movement and experiences worth coming back to.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/store" className="rounded-sm bg-blue-600 px-8 py-3.5 text-sm font-bold uppercase tracking-[.18em] text-white transition hover:bg-blue-500">
                Explore our games
              </Link>
              <Link href="/" className="rounded-sm border border-white/20 px-8 py-3.5 text-sm font-bold uppercase tracking-[.18em] text-white/80 transition hover:border-white/50 hover:text-white">
                Back to home
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1200px] gap-10 px-6 py-24 md:grid-cols-2 md:items-center">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[.35em] text-blue-400">Who we are</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Small studio. Big ideas.</h2>
          <p className="mt-5 leading-relaxed text-white/55">
            We build our games with a simple goal: make every jump, movement and moment feel great.
            From the first prototype to every update, we keep improving the details that make a game fun.
          </p>
        </Reveal>
        <Reveal>
          <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[.03]">
            <div className="absolute h-56 w-56 rounded-full border border-blue-500/20 shadow-[0_0_90px_rgba(0,100,255,.16)]" />
            <div className="absolute h-40 w-40 rounded-full border border-blue-400/30" />
            <Stickman pose="run" className="relative h-44 w-36 text-white" stroke={6} />
            <span className="absolute bottom-6 text-[10px] font-bold uppercase tracking-[.4em] text-white/35">JStick Studios</span>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-6 pb-20">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[.35em] text-blue-400">What matters to us</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Built around the player.</h2>
        </Reveal>
        <Features />
      </section>
      <Footer />
    </main>
  );
}
