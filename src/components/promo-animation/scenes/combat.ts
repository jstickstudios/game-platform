import { DuelScene, DuelCfg } from '../engine/duel';
import { H, W, offscreen, rng } from '../engine/fx';
import { P, Style, track, bump, smooth, clamp } from '../engine/rig';

const GY = 452;

const HERO: Style = { color: '#ffb02e', dark: '#b05a12', glow: '#ff8a1e', accent: '#ff3d3d' };
const FOE: Style = { color: '#c58bff', dark: '#5e2a9e', glow: '#a15cff', accent: '#2ef2ff' };

// ---- poses --------------------------------------------------------------
const ST = P({ tor: 10, l1u: 35, l1l: 10, l2u: -30, l2l: -55, a1u: 70, a1l: 130, a2u: 55, a2l: 125 });
const STB = P({ tor: 14, l1u: 30, l1l: 18, l2u: -26, l2l: -60, a1u: 74, a1l: 134, a2u: 58, a2l: 128 });
const DASH = P({ tor: 34, l1u: 65, l1l: -10, l2u: -55, l2l: -85, a1u: -40, a1l: 50, a2u: 50, a2l: 120 });
const JAB = P({ tor: 14, l1u: 40, l1l: 10, l2u: -35, l2l: -60, a1u: 88, a1l: 92, a2u: 55, a2l: 125 });
const CROSS = P({ tor: 26, l1u: 22, l1l: 0, l2u: -50, l2l: -62, a1u: 60, a1l: 125, a2u: 90, a2l: 92 });
const KICKW = P({ tor: -5, l1u: 50, l1l: -30, l2u: 0, l2l: -5, a1u: 60, a1l: 120, a2u: 50, a2l: 115 });
const RH = P({ tor: -35, l1u: 112, l1l: 108, l2u: -6, l2l: -8, a1u: -50, a1l: 10, a2u: 60, a2l: 120 });
const HITF = P({ tor: -22, hd: -15, l1u: 15, l1l: 10, l2u: -30, l2l: -40, a1u: -30, a1l: 20, a2u: -20, a2l: 30 });
const HITF2 = P({ tor: -32, hd: -24, l1u: 12, l1l: 8, l2u: -34, l2l: -44, a1u: -40, a1l: 10, a2u: -30, a2l: 20 });
const HITB = P({ tor: 38, hd: 22, l1u: 25, l1l: 5, l2u: -20, l2l: -30, a1u: 40, a1l: 100, a2u: 30, a2l: 95 });
const DUCK = P({ tor: 35, l1u: 70, l1l: -30, l2u: -10, l2l: -100, a1u: 70, a1l: 140, a2u: 60, a2l: 135 });
const UPW = P({ tor: 25, l1u: 60, l1l: -30, l2u: -30, l2l: -110, a1u: -30, a1l: 30, a2u: 40, a2l: 120 });
const UPC = P({ y: 22, tor: 12, l1u: 20, l1l: 0, l2u: -20, l2l: -30, a1u: 165, a1l: 175, a2u: 50, a2l: 120 });
const JUMP = P({ snap: 0, y: 100, tor: -10, a1u: 60, a1l: 110, a2u: 40, a2l: 100, l1u: 90, l1l: 20, l2u: 60, l2l: -40 });
const FK = P({ snap: 0, y: 118, tor: -48, hd: 10, l1u: 98, l1l: 98, l2u: 40, l2l: 0, a1u: -60, a1l: -50, a2u: -40, a2l: -30 });
const BLOCK = P({ tor: 14, l1u: 30, l1l: 10, l2u: -30, l2l: -55, a1u: 80, a1l: 160, a2u: 70, a2l: 150 });
const CHARGE = P({ tor: 30, l1u: 50, l1l: -30, l2u: -40, l2l: -90, a1u: -60, a1l: -10, a2u: -50, a2l: -10, hd: 5 });
const VICT = P({ tor: -4, l1u: 12, l2u: -14, a1u: 165, a1l: 175, a2u: 20, a2l: 30 });
const LANDC = P({ tor: 35, l1u: 60, l1l: -45, l2u: 30, l2l: -60, a1u: 50, a1l: 100, a2u: 40, a2l: 90 });
const LAUNCH = (y: number, rot: number) => P({ snap: 0, y, rot, tor: 10, a1u: 120, a1l: 100, a2u: 110, a2l: 90, l1u: 50, l1l: 30, l2u: 30, l2l: 10 });
const LIEB = (rot: number) => P({ snap: 0, y: 14, rot, a1u: 20, a1l: 10, a2u: 40, a2l: 30, l1u: 5, l1l: 5, l2u: -5, l2l: -5 });
const rB = (p: ReturnType<typeof P>) => ({ ...p, rot: -360 });

const heroTr = track([
  { t: 0, p: ST, x: 250 }, { t: 0.4, p: STB }, { t: 0.8, p: ST },
  { t: 1.2, p: DASH, x: 255 }, { t: 1.55, p: DASH, x: 438, e: 'out' },
  { t: 1.82, p: ST, x: 440, e: 'out' },
  { t: 1.95, p: JAB, x: 442, e: 'out' }, { t: 2.08, p: ST, x: 440 },
  { t: 2.18, p: JAB, x: 446, e: 'out' }, { t: 2.32, p: ST, x: 445 },
  { t: 2.45, p: CROSS, x: 455, e: 'out' }, { t: 2.65, p: ST, x: 455 },
  { t: 2.85, p: KICKW, x: 485 }, { t: 2.95, p: RH, x: 520, e: 'out' }, { t: 3.2, p: RH, x: 520 },
  { t: 3.4, p: ST, x: 520 },
  { t: 3.5, p: HITF, x: 508, e: 'out' }, { t: 3.7, p: ST, x: 506 },
  { t: 3.82, p: HITF2, x: 500, e: 'out' },
  { t: 4.0, p: DUCK, x: 500, e: 'out' }, { t: 4.3, p: DUCK, x: 502 },
  { t: 4.36, p: UPW, x: 505 }, { t: 4.42, p: UPC, x: 545, e: 'out' },
  { t: 4.7, p: JUMP, x: 565 },
  { t: 4.95, p: FK, x: 600, e: 'out' }, { t: 5.2, p: FK, x: 640 },
  { t: 5.5, p: LANDC, x: 650, e: 'in' }, { t: 5.8, p: ST, x: 650 },
  { t: 7.0, p: ST, x: 650 },
  { t: 7.15, p: BLOCK, x: 655, e: 'out' }, { t: 7.6, p: BLOCK, x: 612 },
  { t: 7.85, p: KICKW, x: 632 }, { t: 8.0, p: RH, x: 645, e: 'out' },
  { t: 8.3, p: CHARGE, x: 640 }, { t: 8.75, p: CHARGE, x: 640 },
  { t: 8.82, p: DASH, x: 652, e: 'out' },
  { t: 8.95, p: UPC, x: 660, e: 'out' }, { t: 9.3, p: UPC, x: 660 },
  { t: 9.65, p: VICT, x: 660 }, { t: 11.4, p: VICT, x: 660 },
]);

const foeTr = track([
  { t: 0, p: ST, x: 750 }, { t: 0.4, p: STB }, { t: 0.8, p: ST },
  { t: 1.3, p: ST, x: 745 }, { t: 1.55, p: DASH, x: 640, e: 'io' }, { t: 1.8, p: ST, x: 566, e: 'out' },
  { t: 1.95, p: HITF, x: 578, e: 'out' }, { t: 2.1, p: ST, x: 570 },
  { t: 2.18, p: HITF, x: 584, e: 'out' }, { t: 2.3, p: ST, x: 574 },
  { t: 2.45, p: HITF2, x: 600, e: 'out' }, { t: 2.7, p: ST, x: 596 },
  { t: 2.95, p: HITB, x: 612, e: 'out' }, { t: 3.2, p: HITB, x: 606 },
  { t: 3.35, p: ST, x: 604 },
  { t: 3.5, p: JAB, x: 626, e: 'out' }, { t: 3.62, p: ST, x: 622 },
  { t: 3.82, p: CROSS, x: 616, e: 'out' }, { t: 4.0, p: ST, x: 618 },
  { t: 4.08, p: KICKW, x: 618 }, { t: 4.18, p: RH, x: 630, e: 'out' }, { t: 4.4, p: RH, x: 634 },
  { t: 4.55, p: LAUNCH(120, -90), x: 650, e: 'out' },
  { t: 4.85, p: LAUNCH(195, -200), x: 668, e: 'lin' },
  { t: 5.0, p: LAUNCH(150, -245), x: 690, e: 'lin' },
  { t: 5.5, p: LAUNCH(80, -420), x: 925, e: 'out' },
  { t: 5.9, p: LIEB(-450), x: 905, e: 'in' }, { t: 6.4, p: LIEB(-450), x: 905 },
  { t: 6.55, p: P({ snap: 0, y: 55, rot: -405, tor: 0, a1u: 60, a1l: 90, a2u: 50, a2l: 80, l1u: 40, l1l: 20, l2u: 30, l2l: 10 }), x: 890 },
  { t: 6.85, p: rB(ST), x: 880, e: 'out' },
  { t: 6.95, p: rB(LANDC), x: 880 },
  { t: 7.15, p: rB(FK), x: 800, e: 'out' }, { t: 7.4, p: rB(FK), x: 745 },
  { t: 7.7, p: rB(LANDC), x: 722, e: 'in' }, { t: 7.9, p: rB(ST), x: 722 },
  { t: 8.05, p: rB(HITB), x: 740, e: 'out' }, { t: 8.3, p: rB(ST), x: 745 }, { t: 8.7, p: rB(ST), x: 745 },
  { t: 9.0, p: rB(HITF2), x: 750, e: 'out' },
  { t: 9.25, p: LAUNCH(210, -700), x: 850, e: 'out' },
  { t: 9.7, p: LAUNCH(60, -790), x: 900, e: 'in' },
  { t: 10.0, p: LIEB(-810), x: 905, e: 'in' }, { t: 11.4, p: LIEB(-810), x: 905 },
]);

// ---- scenery ------------------------------------------------------------
let BG: HTMLCanvasElement | null = null;
function arena() {
  if (BG) return BG;
  BG = offscreen(W + 80, H, (c) => {
    const g = c.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, '#06030f'); g.addColorStop(0.6, '#150a2e'); g.addColorStop(1, '#2a1048');
    c.fillStyle = g; c.fillRect(0, 0, W + 80, H);
    // brick wall
    const r = rng(2);
    for (let y = 0; y < GY - 40; y += 22) {
      for (let x = -((y / 22) % 2) * 30; x < W + 80; x += 60) {
        const l = 10 + r() * 6;
        c.fillStyle = `hsl(268 ${30 + r() * 15}% ${l}%)`;
        c.fillRect(x + 1, y + 1, 58, 20);
      }
    }
    const vg = c.createLinearGradient(0, 0, 0, GY);
    vg.addColorStop(0, 'rgba(5,2,15,0.85)'); vg.addColorStop(1, 'rgba(5,2,15,0.1)');
    c.fillStyle = vg; c.fillRect(0, 0, W + 80, GY);
    // neon sign
    c.font = '900 italic 92px "Impact","Arial Black",sans-serif';
    c.textAlign = 'center';
    c.shadowColor = '#ff2e9a'; c.shadowBlur = 34;
    c.strokeStyle = '#ff6ac0'; c.lineWidth = 4;
    c.strokeText('FIGHT NIGHT', 540, 140);
    c.shadowBlur = 10; c.fillStyle = 'rgba(255,200,235,0.25)'; c.fillText('FIGHT NIGHT', 540, 140);
    c.shadowBlur = 24; c.shadowColor = '#2ef2ff'; c.strokeStyle = '#2ef2ff'; c.lineWidth = 3;
    c.strokeRect(190, 52, 700, 118);
    c.shadowBlur = 0;
    // stands
    const sg = c.createLinearGradient(0, GY - 120, 0, GY);
    sg.addColorStop(0, '#120826'); sg.addColorStop(1, '#0a0418');
    c.fillStyle = sg; c.fillRect(0, GY - 90, W + 80, 90);
    // floor
    const fg = c.createLinearGradient(0, GY, 0, H);
    fg.addColorStop(0, '#3a1d63'); fg.addColorStop(0.1, '#241044'); fg.addColorStop(1, '#07030f');
    c.fillStyle = fg; c.fillRect(0, GY, W + 80, H - GY);
    c.strokeStyle = 'rgba(255,70,170,0.16)'; c.lineWidth = 2;
    for (let i = 0; i < 8; i++) { const y = GY + 10 + i * i * 2 + i * 5; c.beginPath(); c.moveTo(0, y); c.lineTo(W + 80, y); c.stroke(); }
    for (let i = -8; i < 24; i++) { c.beginPath(); c.moveTo(i * 60, GY + 6); c.lineTo(W / 2 + (i * 60 - W / 2) * 2.8, H); c.stroke(); }
    // ring ellipse
    c.save();
    c.shadowColor = '#2ef2ff'; c.shadowBlur = 18; c.strokeStyle = 'rgba(46,242,255,0.7)'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(500, GY + 56, 470, 40, 0, 0, Math.PI * 2); c.stroke();
    c.restore();
    c.fillStyle = '#ff3d81'; c.shadowColor = '#ff3d81'; c.shadowBlur = 14; c.fillRect(0, GY - 1, W + 80, 3);
  });
  return BG;
}

const cr = rng(31);
const crowd = Array.from({ length: 70 }, (_, i) => ({
  x: (i / 70) * (W + 60) - 20 + cr() * 8, row: i % 2, ph: cr() * 6, h: 30 + cr() * 14, arms: cr() > 0.5,
  col: `hsl(${260 + cr() * 60} 35% ${8 + cr() * 7}%)`,
}));

const cracks: [number, number, number, number][] = [];

const cfg: DuelCfg = {
  len: 11.4,
  ground: GY,
  hero: { tr: heroTr, style: HERO, sword: false, face: 1 },
  foe: { tr: foeTr, style: FOE, sword: false, face: -1 },
  events: [
    { t: 1.5, k: 'dash' },
    { t: 1.95, k: 'hit', by: 'A', limb: 'h1', power: 0.7, text: 'JAB' },
    { t: 2.18, k: 'hit', by: 'A', limb: 'h1', power: 0.7 },
    { t: 2.45, k: 'hit', by: 'A', limb: 'h2', power: 1.1, text: 'CROSS!' },
    { t: 2.97, k: 'hit', by: 'A', limb: 'f1', power: 1.5, text: 'ROUNDHOUSE!' },
    { t: 3.5, k: 'hit', by: 'B', limb: 'h1', power: 0.8 },
    { t: 3.82, k: 'hit', by: 'B', limb: 'h2', power: 1.1 },
    { t: 4.44, k: 'hit', by: 'A', limb: 'h1', power: 1.9, text: 'UPPERCUT!' },
    { t: 5.0, k: 'hit', by: 'A', limb: 'f1', power: 2.2, text: 'FLYING KICK!' },
    { t: 5.5, k: 'wall' },
    { t: 5.55, k: 'land' },
    { t: 5.95, k: 'lie' },
    { t: 6.85, k: 'kip' },
    { t: 7.4, k: 'hit', by: 'B', limb: 'f1', power: 0.6, text: 'BLOCKED' },
    { t: 7.72, k: 'land' },
    { t: 8.02, k: 'hit', by: 'A', limb: 'f1', power: 1.4, text: 'HIGH KICK!' },
    { t: 8.3, k: 'charge' },
    { t: 9.0, k: 'ko' },
    { t: 10.0, k: 'lie' },
  ],
  slow: [
    { t: 1.95, w: 0.1, s: 0.3 }, { t: 2.45, w: 0.1, s: 0.3 }, { t: 2.97, w: 0.12, s: 0.25 },
    { t: 4.44, w: 0.15, s: 0.2 }, { t: 5.0, w: 0.2, s: 0.2 }, { t: 5.5, w: 0.15, s: 0.35 },
    { t: 8.02, w: 0.12, s: 0.3 }, { t: 9.0, w: 0.45, s: 0.1 },
  ],
  lock: [[9.0, 11.4]],
  label: (T) =>
    T < 1.3 ? 'FIGHT STANCE' : T < 2.9 ? 'JAB · JAB · CROSS' : T < 3.4 ? 'ROUNDHOUSE KICK' : T < 4.4 ? 'COUNTER ATTACK · DUCK' : T < 5.5 ? 'UPPERCUT + FLYING KICK' : T < 6.9 ? 'WALL SLAM' : T < 8.3 ? 'FLYING KICK BLOCKED' : T < 9.6 ? 'DRAGON PUNCH FINISHER' : 'K.O. VICTORY',
  bg: (ctx, s) => {
    ctx.drawImage(arena(), -40, 0);
    const t = s.real;
    const pulse = s.extra.pulse ?? 0;
    // crowd
    for (const p of crowd) {
      const y = GY - 40 - p.row * 20 + Math.sin(t * 5 + p.ph) * (p.arms ? 4 : 2) - pulse * 5;
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.ellipse(p.x, y + 30, 18, p.h * 0.7, 0, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, y - 3, 8.5, 0, Math.PI * 2); ctx.fill();
      if (p.arms) {
        ctx.strokeStyle = p.col; ctx.lineWidth = 5; ctx.lineCap = 'round';
        const w = Math.sin(t * 7 + p.ph) * 6;
        ctx.beginPath(); ctx.moveTo(p.x - 12, y + 16); ctx.lineTo(p.x - 18 + w, y - 18); ctx.moveTo(p.x + 12, y + 16); ctx.lineTo(p.x + 18 - w, y - 18); ctx.stroke();
      }
      // rim light
      ctx.fillStyle = `rgba(255,80,190,${0.12 + pulse * 0.25})`;
      ctx.beginPath(); ctx.arc(p.x, y - 3, 8.5, Math.PI * 1.1, Math.PI * 1.9); ctx.lineTo(p.x, y - 3); ctx.fill();
    }
    // spotlights
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const ox = 220 + i * 280;
      const sw = Math.sin(t * 0.8 + i * 2) * 120;
      const col = i === 1 ? '255,61,129' : i === 0 ? '46,242,255' : '255,176,46';
      const g = ctx.createLinearGradient(ox, 0, ox + sw, GY + 30);
      g.addColorStop(0, `rgba(${col},${0.32 + pulse * 0.25})`); g.addColorStop(1, `rgba(${col},0.02)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(ox - 8, -10); ctx.lineTo(ox + 8, -10); ctx.lineTo(ox + sw + 100, GY + 30); ctx.lineTo(ox + sw - 100, GY + 30); ctx.fill();
    }
    ctx.restore();
    // right wall
    const wg = ctx.createLinearGradient(955, 0, 1040, 0);
    wg.addColorStop(0, '#1b0f33'); wg.addColorStop(1, '#0a0516');
    ctx.fillStyle = wg; ctx.fillRect(962, -50, 80, GY + 60);
    ctx.fillStyle = '#2ef2ff'; ctx.shadowColor = '#2ef2ff'; ctx.shadowBlur = 12; ctx.fillRect(960, -50, 3, GY + 60); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2.5; ctx.shadowColor = '#ffb02e'; ctx.shadowBlur = 8; ctx.lineCap = 'round';
    for (const [x1, y1, x2, y2] of cracks) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    ctx.shadowBlur = 0;
  },
  front: (ctx, s) => {
    // charge aura
    const a = s.extra.aura ?? 0;
    if (a > 0) {
      const sk = s.hero.skel;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(sk.hip[0], sk.hip[1] - 20, 10, sk.hip[0], sk.hip[1] - 20, 110);
      g.addColorStop(0, `rgba(255,170,40,${0.5 * a})`); g.addColorStop(1, 'rgba(255,100,20,0)');
      ctx.fillStyle = g; ctx.fillRect(sk.hip[0] - 120, sk.hip[1] - 140, 240, 240);
      ctx.restore();
    }
  },
  hud: (ctx, s) => {
    const e = s.extra;
    const hpA = clamp(e.hpA ?? 100, 0, 100), hpB = clamp(e.hpB ?? 100, 0, 100);
    e.dA = (e.dA ?? 100) + (hpA - (e.dA ?? 100)) * 0.03;
    e.dB = (e.dB ?? 100) + (hpB - (e.dB ?? 100)) * 0.03;
    const bar = (x: number, w: number, v: number, d: number, col: string, right: boolean, name: string) => {
      ctx.save();
      ctx.transform(1, 0, right ? 0.3 : -0.3, 1, right ? -6 : 6, 0);
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x, 24, w, 18);
      const f = (val: number) => (right ? x + w - (w * val) / 100 : x);
      ctx.fillStyle = '#fff'; ctx.fillRect(f(d), 24, (w * d) / 100, 18);
      ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.fillStyle = col; ctx.fillRect(f(v), 24, (w * v) / 100, 18);
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.strokeRect(x, 24, w, 18);
      ctx.restore();
      ctx.font = '900 italic 20px "Impact","Arial Black",sans-serif';
      ctx.textAlign = right ? 'right' : 'left'; ctx.fillStyle = '#fff'; ctx.shadowColor = col; ctx.shadowBlur = 8;
      ctx.fillText(name, right ? x + w : x, 64); ctx.shadowBlur = 0;
    };
    bar(48, 380, hpA, e.dA, '#ffb02e', false, 'KAI');
    bar(572, 380, hpB, e.dB, '#c58bff', true, 'VEX');
    ctx.font = '900 italic 28px "Impact","Arial Black",sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#ff3d81'; ctx.shadowColor = '#ff3d81'; ctx.shadowBlur = 12; ctx.fillText('VS', 500, 44); ctx.shadowBlur = 0;
    // combo
    const cb = e.combo ?? 0;
    if (cb >= 2) {
      const pop = 1 + Math.max(0, 0.5 - (s.real - (e.comboAt ?? 0))) * 1.2;
      ctx.save();
      ctx.translate(50, 250); ctx.scale(pop, pop); ctx.rotate(-0.06);
      ctx.font = '900 italic 64px "Impact","Arial Black",sans-serif'; ctx.textAlign = 'left';
      ctx.lineWidth = 8; ctx.strokeStyle = '#05050c'; ctx.lineJoin = 'round'; ctx.strokeText(String(cb), 0, 0);
      ctx.fillStyle = '#ffd23d'; ctx.shadowColor = '#ff8a1e'; ctx.shadowBlur = 18; ctx.fillText(String(cb), 0, 0);
      ctx.font = '900 italic 26px "Impact","Arial Black",sans-serif';
      ctx.shadowBlur = 8; ctx.fillStyle = '#fff'; ctx.fillText('HIT COMBO', 78, -4);
      ctx.restore();
    }
  },
  onReset: (s) => {
    cracks.length = 0;
    s.extra = { hpA: 100, hpB: 100, dA: 100, dB: 100, combo: 0, pulse: 0, aura: 0 };
  },
  onUpdate: (dt, s) => {
    const e = s.extra;
    e.pulse = Math.max(0, (e.pulse ?? 0) - dt * 3);
    const T = s.T;
    if (T > 8.3 && T < 8.95) {
      e.aura = Math.min(1, (e.aura ?? 0) + dt * 3);
      const sk = s.hero.skel;
      s.fx.spark(sk.hip[0] + (Math.random() - 0.5) * 60, s.cfg.ground - 2, 2, '#ffb02e', 220, -Math.PI / 2, 0.7, -500);
      s.fx.spark(sk.hip[0] + (Math.random() - 0.5) * 40, s.cfg.ground - 2, 1, '#fff', 180, -Math.PI / 2, 0.5, -500);
      s.fx.shake = Math.max(s.fx.shake, 1.5);
    } else e.aura = Math.max(0, (e.aura ?? 0) - dt * 4);
  },
  cam: (T) => 0.08 * smooth(bump(T - 9.3, 0.9)),
  onEvent: (ev, s) => {
    const fx = s.fx, g = s.cfg.ground, e = s.extra;
    if (ev.k === 'hit') {
      const atk = ev.by === 'A' ? s.hero : s.foe;
      const vic = ev.by === 'A' ? s.foe : s.hero;
      const [x, y] = atk.tip(ev.limb ?? 'h1');
      const col = ev.by === 'A' ? '#ffb02e' : '#c58bff';
      const dir = atk.face > 0 ? 0 : Math.PI;
      fx.impact(x, y, col, ev.power ?? 1, dir);
      if (ev.text) fx.text(x + atk.face * 20, y - 70, ev.text, ev.by === 'A' ? '#ffd23d' : '#e2c4ff', 24 + (ev.power ?? 1) * 10);
      e.pulse = 1;
      if (ev.by === 'A') { e.hpB = (e.hpB ?? 100) - (ev.power ?? 1) * 5; e.combo = (e.combo ?? 0) + 1; e.comboAt = s.real; }
      else { e.hpA = (e.hpA ?? 100) - (ev.power ?? 1) * 5; e.combo = 0; }
      void vic;
    } else if (ev.k === 'dash') {
      fx.dust(s.hero.x, g, 10, 'rgba(255,190,220,0.45)', 100);
      fx.dust(s.foe.x, g, 10, 'rgba(255,190,220,0.45)', 100);
      fx.ring(s.hero.x, g, '#ffb02e', 80, 0.4, 3);
      fx.ring(s.foe.x, g, '#a15cff', 80, 0.4, 3);
    } else if (ev.k === 'wall') {
      const b = s.foe;
      fx.impact(958, b.skel.hip[1], '#ffffff', 2.4, Math.PI);
      fx.spark(958, b.skel.hip[1], 30, '#ffb02e', 700, Math.PI, 2);
      fx.ring(958, b.skel.hip[1], '#2ef2ff', 160, 0.6, 6);
      fx.text(900, g - 250, 'WALL SLAM!', '#2ef2ff', 48);
      const cy = b.skel.hip[1];
      cracks.push([962, cy - 10, 925, cy - 60], [925, cy - 60, 905, cy - 50], [925, cy - 60, 915, cy - 100], [962, cy - 10, 930, cy + 30], [930, cy + 30, 912, cy + 25], [962, cy - 10, 940, cy - 20]);
      e.pulse = 1; e.hpB = (e.hpB ?? 100) - 8;
    } else if (ev.k === 'land') {
      const f = ev.t < 6 ? s.hero : s.foe;
      fx.dust(f.x, g, 14, 'rgba(255,190,220,0.5)', 130);
      fx.ring(f.x, g, '#ffb02e', 100, 0.4, 4);
      fx.shake = Math.max(fx.shake, 5);
    } else if (ev.k === 'lie') {
      fx.dust(s.foe.x - 20, g, 16, 'rgba(255,190,220,0.5)', 140);
      fx.ring(s.foe.x - 20, g, '#a15cff', 110, 0.5, 4);
      fx.shake = Math.max(fx.shake, 6);
    } else if (ev.k === 'kip') {
      fx.dust(s.foe.x, g, 10, 'rgba(255,190,220,0.45)', 100);
      fx.text(s.foe.x - 30, g - 180, 'GETS UP!', '#c58bff', 30);
    } else if (ev.k === 'charge') {
      fx.text(s.hero.x, g - 190, 'POWER UP!', '#ffb02e', 36);
      fx.ring(s.hero.x, g - 20, '#ffb02e', 130, 0.7, 6);
    } else if (ev.k === 'ko') {
      const [x, y] = s.hero.tip('h1');
      fx.impact(x, y, '#ffffff', 3.2, 0);
      fx.spark(x, y, 50, '#ffb02e', 900, 0, Math.PI * 2);
      fx.spark(x, y, 30, '#ff3d3d', 700, 0, Math.PI * 2);
      fx.ring(x, y, '#ffb02e', 260, 0.7, 8);
      fx.flash = 0.9; fx.flashColor = '#fff4d0'; fx.shake = 20; fx.zoom = 0.1;
      fx.text(x - 20, y - 120, 'K.O.!', '#ffd23d', 80);
      e.pulse = 1; e.hpB = 0; e.combo = (e.combo ?? 0) + 1; e.comboAt = s.real;
    }
  },
};

export class CombatScene extends DuelScene {
  constructor() { super(cfg); }
}
