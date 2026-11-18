"use client";

import Image from "next/image";
import Link from "next/link";
import { GAMES } from "@/lib/games";
import Reveal from "@/components/Reveal";

const updates = [
  { tag: "PLATFORM", title: "The studio dashboard is here", detail: "A new home for the JStick catalogue, studio notes and current activity.", status: "JUST ADDED" },
  { tag: "CATALOGUE", title: "One place for every game", detail: "Explore the existing lineup with direct links to each game's page.", status: "LIVE" },
  { tag: "WHAT'S NEXT", title: "More polish. More ideas.", detail: "The focus stays on better game feel, memorable visuals and smoother experiences.", status: "IN PROGRESS" },
];

export default function StudioDashboard() {
  const freeCount = GAMES.filter((game) => game.priceCents === 0).length;
  const latest = GAMES.slice(-3).reverse();

  return (
    <section id="studio-dashboard" className="studio-dashboard relative mx-auto mt-24 w-full max-w-[1400px] scroll-mt-28 px-4 sm:px-6 lg:px-10">
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="dashboard-eyebrow">JSTICK / LIVE STUDIO FEED</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Inside the studio<span className="text-brand-2">.</span></h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">A live snapshot of the games, updates and ideas coming out of JStick Studios.</p>
          </div>
          <Link href="/studio" className="dashboard-link">Explore the studio <span aria-hidden="true">↗</span></Link>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        <Reveal delay={60}>
          <article className="dashboard-stat">
            <span className="dashboard-stat-label">GAMES IN THE CATALOGUE</span>
            <strong>{String(GAMES.length).padStart(2, "0")}</strong>
            <span className="dashboard-stat-foot"><i /> Existing titles, all in one place</span>
          </article>
        </Reveal>
        <Reveal delay={120}>
          <article className="dashboard-stat">
            <span className="dashboard-stat-label">FREE TO PLAY / DOWNLOAD</span>
            <strong>{String(freeCount).padStart(2, "0")}<small>/{String(GAMES.length).padStart(2, "0")}</small></strong>
            <span className="dashboard-stat-foot"><i /> Based on current store prices</span>
          </article>
        </Reveal>
        <Reveal delay={180}>
          <article className="dashboard-stat dashboard-stat-live">
            <span className="dashboard-stat-label">STUDIO STATUS</span>
            <strong className="dashboard-live-word">CREATING<span className="dashboard-live-dot" /></strong>
            <span className="dashboard-stat-foot"><i /> Independent games. Big energy.</span>
          </article>
        </Reveal>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <Reveal delay={100}>
          <div className="dashboard-panel h-full">
            <div className="dashboard-panel-head">
              <div><span className="dashboard-eyebrow">THE CURRENT LINEUP</span><h3>Latest in the lineup</h3></div>
              <span className="dashboard-count">{latest.length} TITLES</span>
            </div>
            <div className="dashboard-release-list">
              {latest.map((game, index) => (
                <Link href={`/games/${game.slug}`} key={game.slug} className="dashboard-release">
                  <div className="dashboard-release-art">
                    <Image src={`/images/${game.image}`} alt="" fill sizes="88px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="dashboard-release-kicker">CATALOGUE TITLE / 0{index + 1}</span>
                    <h4>{game.title}</h4>
                    <p>{game.priceCents === 0 ? "Free to download" : "Available in the store"}</p>
                  </div>
                  <span className="dashboard-release-arrow" aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
            <Link href="/store" className="dashboard-all-games">VIEW FULL CATALOGUE <span>↗</span></Link>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="dashboard-panel h-full">
            <div className="dashboard-panel-head">
              <div><span className="dashboard-eyebrow">TRANSMISSIONS</span><h3>Studio updates</h3></div>
              <span className="dashboard-live-pill"><i /> LIVE FEED</span>
            </div>
            <div className="dashboard-update-list">
              {updates.map((update, index) => (
                <article className="dashboard-update" key={update.title}>
                  <div className="dashboard-update-index">0{index + 1}</div>
                  <div className="min-w-0">
                    <div className="dashboard-update-meta"><span>{update.tag}</span><span>{update.status}</span></div>
                    <h4>{update.title}</h4>
                    <p>{update.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
