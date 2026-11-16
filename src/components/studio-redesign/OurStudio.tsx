"use client";

import Link from "next/link";
import Image from "next/image";
import { GAMES } from "@/lib/games";
import StickmanStage from "./components/StickmanStage";

const principles = [
  { number: "01", title: "Gameplay first", text: "Every idea starts with one question: is it genuinely fun to play?" },
  { number: "02", title: "Built with care", text: "Responsive controls, readable visuals and satisfying animation matter." },
  { number: "03", title: "Always creating", text: "We experiment, learn from every release and keep pushing our games forward." },
];

export default function OurStudio() {
  return (
    <main className="studio-blue-page">
      <section className="sb-hero">
        <div className="sb-hero-grid" aria-hidden="true" />
        <div className="sb-orb sb-orb-one" aria-hidden="true" />
        <div className="sb-orb sb-orb-two" aria-hidden="true" />
        <div className="sb-hero-inner">
          <div className="sb-hero-copy">
            <div className="sb-kicker"><span /> INDEPENDENT GAME STUDIO</div>
            <h1>WE MAKE<br /><span>GAMES</span><br />THAT MOVE YOU.</h1>
            <p>Ideas become worlds. Movement becomes a feeling. Welcome to JStick Studios.</p>
            <div className="sb-actions">
              <a className="sb-button sb-button-primary" href="#our-games">Explore our games <span>↗</span></a>
              <a className="sb-button sb-button-quiet" href="#about">Meet the studio <span>↓</span></a>
            </div>
            <div className="sb-hero-meta"><span className="sb-live-dot" /> CREATING. TESTING. LEVELING UP.</div>
          </div>
          <div className="sb-hero-art">
            <div className="sb-art-frame">
              <div className="sb-art-top"><span>JSTICK / STUDIO VISUALS</span><span>001 — RUN</span></div>
              <StickmanStage />
              <div className="sb-art-bottom"><span>BUILT FOR THE PLAYERS</span><span>EST. IN PROGRESS</span></div>
            </div>
            <div className="sb-floating-tag sb-tag-top">⚡ MOVEMENT</div>
            <div className="sb-floating-tag sb-tag-bottom">✦ ORIGINAL IDEAS</div>
          </div>
        </div>
        <a className="sb-scroll" href="#about">SCROLL TO EXPLORE <span>↓</span></a>
      </section>

      <section id="about" className="sb-about sb-section">
        <div className="sb-section-label"><span>01</span> / WHO WE ARE</div>
        <div className="sb-about-layout">
          <h2>SMALL STUDIO.<br /><em>BIG ENERGY.</em></h2>
          <div className="sb-about-copy">
            <p className="sb-lead">JStick Studios is an independent game studio focused on creating fun, polished games with personality.</p>
            <p>We care about the details players feel: tight controls, smooth movement, satisfying feedback and worlds that make you want to play one more round.</p>
            <Link href="/store" className="sb-text-link">Discover what we're making <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section id="our-games" className="sb-games sb-section">
        <div className="sb-section-heading">
          <div><div className="sb-section-label"><span>02</span> / THE LINEUP</div><h2>MADE TO <em>PLAY.</em></h2></div>
          <Link href="/store" className="sb-text-link">VISIT THE STORE <span>↗</span></Link>
        </div>
        <div className="sb-game-grid">
          {GAMES.map((game, index) => (
            <Link href="/store" key={game.slug} className="sb-game-card">
              <div className="sb-game-image">
                <Image src={`/images/${game.image}`} alt={game.title} fill sizes="(max-width: 700px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="sb-game-index">0{index + 1}</span>
                <span className="sb-game-arrow">↗</span>
              </div>
              <div className="sb-game-info"><div><span className="sb-game-type">JSTICK ORIGINAL</span><h3>{game.title}</h3><p>{game.tagline}</p></div><span className="sb-card-arrow">↗</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="sb-principles sb-section">
        <div className="sb-section-label"><span>03</span> / WHAT WE BELIEVE</div>
        <div className="sb-principles-heading"><h2>THE DETAILS<br />MAKE THE <em>DIFFERENCE.</em></h2><p>Good games aren't built from one big feature. They're built from hundreds of little things that feel just right.</p></div>
        <div className="sb-principle-list">
          {principles.map((item) => <article className="sb-principle" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p><b>↗</b></article>)}
        </div>
      </section>

      <section className="sb-final">
        <div className="sb-final-glow" aria-hidden="true" />
        <div className="sb-section-label"><span>04</span> / YOUR NEXT GAME</div>
        <h2>READY<br />PLAYER <em>ONE.</em></h2>
        <p>Find your next challenge in the JStick Studios game collection.</p>
        <Link href="/store" className="sb-button sb-button-primary">Explore the games <span>↗</span></Link>
        <div className="sb-final-wordmark">JSTICK STUDIOS</div>
      </section>
    </main>
  );
}
