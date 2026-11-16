import { useRef, type CSSProperties, type PointerEvent } from "react";

/** Jointed stickman rig. All motion is CSS (transform only) so it stays on the compositor. */
function Runner({ ghost = false, delay = -0.3 }: { ghost?: boolean; delay?: number }) {
  return (
    <svg
      className={`rn ${ghost ? "is-ghost" : ""}`}
      viewBox="0 0 240 300"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ "--rn-d": `${delay}s` } as CSSProperties}
    >
      <g stroke="var(--rn-stroke)" strokeWidth={ghost ? 9 : 6.5} strokeLinecap="round" strokeLinejoin="round">
        <g className="rn-bob">
          {/* far-side leg */}
          <g opacity={ghost ? 1 : 0.5}>
            <g className="rn-thigh-b">
              <line x1="120" y1="170" x2="120" y2="216" />
              <g className="rn-shin-b">
                <line x1="120" y1="216" x2="120" y2="262" />
                <line x1="120" y1="262" x2="136" y2="262" />
              </g>
            </g>
          </g>
          {/* near-side leg */}
          <g className="rn-thigh-a">
            <line x1="120" y1="170" x2="120" y2="216" />
            <g className="rn-shin-a">
              <line x1="120" y1="216" x2="120" y2="262" />
              <line x1="120" y1="262" x2="136" y2="262" />
            </g>
          </g>

          <g className="rn-lean">
            {/* scarf */}
            {!ghost && (
              <g className="rn-scarf">
                <path d="M118 106 C 100 98, 84 118, 58 104" stroke="#2f7bff" strokeWidth="4" />
                <path d="M112 108 C 98 106, 88 120, 70 114" stroke="#9ccaff" strokeWidth="2.5" opacity="0.8" />
              </g>
            )}
            {/* far arm */}
            <g opacity={ghost ? 1 : 0.5}>
              <g className="rn-arm-b">
                <line x1="120" y1="110" x2="120" y2="144" />
                <g className="rn-fore-b">
                  <line x1="120" y1="144" x2="120" y2="176" />
                </g>
              </g>
            </g>
            {/* torso */}
            <line x1="120" y1="170" x2="120" y2="106" />
            {/* head */}
            <circle cx="120" cy="82" r="16" fill="#02040a" />
            {/* near arm */}
            <g className="rn-arm-a">
              <line x1="120" y1="110" x2="120" y2="144" />
              <g className="rn-fore-a">
                <line x1="120" y1="144" x2="120" y2="176" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

const streaks = [
  { top: "34%", w: "34%", dur: 1.1, dl: 0, op: 0.7 },
  { top: "43%", w: "26%", dur: 1.5, dl: 0.4, op: 0.5 },
  { top: "52%", w: "40%", dur: 1.2, dl: 0.8, op: 0.8 },
  { top: "60%", w: "22%", dur: 1.7, dl: 0.2, op: 0.5 },
  { top: "68%", w: "32%", dur: 1.3, dl: 1.0, op: 0.65 },
  { top: "27%", w: "20%", dur: 1.8, dl: 0.6, op: 0.4 },
];

const sparks = [
  { left: "30%", top: "70%", dx: -50, dy: -120, s: 3, dur: 4.2, dl: 0 },
  { left: "42%", top: "72%", dx: -30, dy: -150, s: 2, dur: 5.1, dl: 0.9 },
  { left: "58%", top: "71%", dx: -70, dy: -110, s: 3, dur: 4.6, dl: 1.7 },
  { left: "70%", top: "69%", dx: -40, dy: -140, s: 2, dur: 5.4, dl: 2.4 },
  { left: "24%", top: "60%", dx: -20, dy: -100, s: 2, dur: 4.8, dl: 3.1 },
  { left: "76%", top: "55%", dx: 24, dy: -90, s: 3, dur: 5.2, dl: 1.2 },
  { left: "50%", top: "30%", dx: 30, dy: -60, s: 2, dur: 4.4, dl: 2.8 },
  { left: "36%", top: "40%", dx: -36, dy: -70, s: 2, dur: 5.6, dl: 0.5 },
];

export default function StickmanStage() {
  const inner = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !inner.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    inner.current.style.setProperty("--rx", `${(px * 8).toFixed(2)}deg`);
    inner.current.style.setProperty("--ry", `${(-py * 8).toFixed(2)}deg`);
  };
  const onLeave = () => {
    inner.current?.style.setProperty("--rx", "0deg");
    inner.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      className="stage"
      role="img"
      aria-label="A glowing stickman running inside rotating rings of light"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div ref={inner} className="stage-inner" aria-hidden="true">
        <div className="stage-glow" />

        {/* rotating rings */}
        <svg className="orbit-svg" viewBox="0 0 400 400" fill="none">
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#9ccaff" />
              <stop offset="1" stopColor="#2f7bff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ringGrad2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2f7bff" />
              <stop offset="1" stopColor="#bfdcff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* outer dotted ring */}
          <g className="spin spin-cw-60">
            <circle cx="200" cy="200" r="192" stroke="rgba(160,200,255,0.35)" strokeWidth="1.5" strokeDasharray="1 11" strokeLinecap="round" />
          </g>
          {/* arc ring with orbiting node */}
          <g className="spin spin-cw-14">
            <circle cx="200" cy="200" r="172" stroke="url(#ringGrad)" strokeWidth="2" strokeDasharray="300 782" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px #2f7bff)" }} />
            <circle cx="372" cy="200" r="4.5" fill="#fff" style={{ filter: "drop-shadow(0 0 8px #6cb4ff)" }} />
          </g>
          {/* tick ring */}
          <g className="spin spin-ccw-40">
            <circle cx="200" cy="200" r="150" stroke="rgba(120,175,255,0.5)" strokeWidth="9" strokeDasharray="1.5 16" />
          </g>
          {/* inner counter-rotating segments */}
          <g className="spin spin-ccw-9">
            <circle cx="200" cy="200" r="128" stroke="url(#ringGrad2)" strokeWidth="2.5" strokeDasharray="120 160 40 484" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 5px #2f7bff)" }} />
            <circle cx="72" cy="200" r="3.5" fill="#bfdcff" style={{ filter: "drop-shadow(0 0 6px #2f7bff)" }} />
          </g>
          <circle cx="200" cy="200" r="106" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </svg>

        <div className="pulse-ring" />
        <div className="pulse-ring p2" />

        <div className="ground-reflect" />
        <div className="ground" />
        <div className="ground-dash" />

        {/* speed streaks clipped to the circle */}
        <div className="streak-clip">
          {streaks.map((s, i) => (
            <span
              key={i}
              className="streak"
              style={{ top: s.top, width: s.w, "--dur": `${s.dur}s`, "--dl": `${s.dl}s`, "--op": s.op } as CSSProperties}
            />
          ))}
        </div>

        {/* energy trail: lagging afterimages */}
        <div className="runner-wrap ghost-3"><Runner ghost delay={-0.3 + 0.27} /></div>
        <div className="runner-wrap ghost-2"><Runner ghost delay={-0.3 + 0.18} /></div>
        <div className="runner-wrap ghost-1"><Runner ghost delay={-0.3 + 0.09} /></div>
        <div className="runner-wrap"><Runner /></div>

        {sparks.map((s, i) => (
          <span
            key={i}
            className="spark"
            style={{ left: s.left, top: s.top, "--dx": `${s.dx}px`, "--dy": `${s.dy}px`, "--s": `${s.s}px`, "--dur": `${s.dur}s`, "--dl": `${s.dl}s` } as CSSProperties}
          />
        ))}

        <span className="hud-corner tl" />
        <span className="hud-corner tr" />
        <span className="hud-corner bl" />
        <span className="hud-corner br" />
      </div>
    </div>
  );
}
