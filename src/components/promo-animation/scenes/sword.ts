import { DuelScene, DuelCfg } from '../engine/duel';
import { H, W, offscreen, rng } from '../engine/fx';
import { P, Style, track, bump, smooth } from '../engine/rig';

const GY = 452;

const HERO: Style = { color: '#dff3ff', dark: '#5b8fb0', glow: '#6fd6ff', accent: '#38c8ff', blade: '#8ff3ff' };
const FOE: Style = { color: '#ff5468', dark: '#8a1c3a', glow: '#ff2e55', accent: '#ffd23d', blade: '#ff8a9a' };

// ---- poses --------------------------------------------------------------
const G = P({ tor: 8, l1u: 28, l1l: 8, l2u: -28, l2l: -50, a1u: 75, a1l: 95, a2u: 60, a2l: 100, sw: 15 });
const GB = P({ tor: 12, l1u: 22, l1l: 14, l2u: -22, l2l: -56, a1u: 80, a1l: 100, a2u: 62, a2l: 104, sw: 14 });
const GE = P({ tor: 8, l1u: 28, l1l: 8, l2u: -28, l2l: -50, a1u: 60, a1l: 78, a2u: 50, a2l: 90, sw: 14 });
const GEB = P({ tor: 12, l1u: 22, l1l: 14, l2u: -22, l2l: -56, a1u: 64, a1l: 82, a2u: 52, a2l: 94, sw: 14 });
const WSIDE = P({ tor: 14, l1u: 40, l1l: 5, l2u: -35, l2l: -60, a1u: -40, a1l: -30, a2u: -30, a2l: -20, sw: -40 });
const SLASH_H = P({ tor: 20, l1u: 58, l1l: 0, l2u: -42, l2l: -58, a1u: 90, a1l: 92, a2u: 80, a2l: 85, sw: 0 });
const WHIGH = P({ tor: 0, l1u: 30, l1l: 0, l2u: -30, l2l: -45, a1u: 150, a1l: 170, a2u: 140, a2l: 165, sw: 20 });
const SDOWN = P({ tor: 25, l1u: 62, l1l: 5, l2u: -45, l2l: -60, a1u: 70, a1l: 80, a2u: 65, a2l: 75, sw: -15 });
const PARRY = P({ tor: 6, l1u: 25, l1l: 5, l2u: -28, l2l: -48, a1u: 115, a1l: 135, a2u: 105, a2l: 130, sw: 10 });
const CROUCH = P({ tor: 40, l1u: 80, l1l: -20, l2u: -20, l2l: -110, a1u: 120, a1l: 140, a2u: 110, a2l: 135, sw: 20 });
const DRAW = P({ tor: 36, l1u: 70, l1l: -20, l2u: -30, l2l: -110, a1u: -20, a1l: -30, a2u: -10, a2l: -20, sw: -60 });
const FOLLOW = P({ tor: 32, l1u: 68, l1l: 5, l2u: -55, l2l: -70, a1u: 78, a1l: 78, a2u: 60, a2l: 70, sw: -5 });
const RELAX = P({ tor: 0, a1u: 6, a1l: 22, a2u: -4, a2l: 14, sw: -22 });
const STAGGER = P({ tor: -26, l1u: 12, l1l: 12, l2u: -25, l2l: -40, a1u: -30, a1l: -10, a2u: -20, a2l: 0, sw: -10, hd: -10 });
const KNEEL = P({ tor: 10, l1u: 90, l1l: 0, l2u: -20, l2l: -110, a1u: 20, a1l: 15, a2u: 10, a2l: 10, sw: -5, hd: 25 });
const TAKEOFF = P({ snap: 0, y: 84, tor: 5, a1u: 150, a1l: 170, a2u: 140, a2l: 165, sw: 25, l1u: 10, l1l: 5, l2u: -10, l2l: -10 });
const APEX = P({ snap: 0, y: 190, rot: 150, tor: 25, a1u: 70, a1l: 120, a2u: 65, a2l: 115, l1u: 112, l1l: -10, l2u: 105, l2l: -20, sw: 40 });
const DIVE = P({ snap: 0, y: 150, rot: 300, tor: 20, a1u: 100, a1l: 100, a2u: 95, a2l: 95, l1u: 70, l1l: 30, l2u: 50, l2l: 10, sw: 0 });
const LAND = P({ snap: 0, y: 36, rot: 360, tor: 30, a1u: 80, a1l: 85, a2u: 70, a2l: 75, l1u: 60, l1l: -20, l2u: 30, l2l: -50, sw: -15 });
const LIE = P({ snap: 0, y: 13, rot: 272, a1u: -20, a1l: -10, a2u: 30, a2l: 20, l1u: 5, l1l: 5, l2u: -5, l2l: -5, sw: 0 });
const r360 = (p: ReturnType<typeof P>) => ({ ...p, rot: 360 });

const heroTr = track([
  { t: 0, p: G, x: 270 }, { t: 0.55, p: GB }, { t: 1.1, p: G },
  { t: 1.4, p: WSIDE, x: 285 },
  { t: 1.78, p: SLASH_H, x: 414, e: 'out' },
  { t: 2.15, p: SLASH_H, x: 410 },
  { t: 2.55, p: G, x: 385 },
  { t: 2.85, p: WHIGH, x: 390 },
  { t: 3.08, p: SDOWN, x: 420, e: 'out' },
  { t: 3.4, p: SDOWN, x: 416 },
  { t: 3.75, p: G, x: 360 },
  { t: 3.95, p: CROUCH, x: 360, e: 'out' },
  { t: 4.6, p: CROUCH, x: 362 },
  { t: 4.8, p: WHIGH, x: 385 },
  { t: 5.0, p: SDOWN, x: 387, e: 'out' },
  { t: 5.2, p: PARRY, x: 385 },
  { t: 5.33, p: SLASH_H, x: 388, e: 'out' },
  { t: 5.5, p: WHIGH, x: 385 },
  { t: 5.63, p: SDOWN, x: 388, e: 'out' },
  { t: 5.9, p: G, x: 385 },
  { t: 6.2, p: DRAW, x: 392 },
  { t: 6.55, p: DRAW, x: 392 },
  { t: 6.7, p: SLASH_H, x: 120 },
  { t: 6.95, p: FOLLOW, x: 112, e: 'out' },
  { t: 7.4, p: WHIGH, x: 112 },
  { t: 7.9, p: RELAX, x: 112 },
  { t: 10.8, p: RELAX, x: 112 },
]);

const foeTr = track([
  { t: 0, p: GE, x: 730 }, { t: 0.55, p: GEB }, { t: 1.1, p: GE },
  { t: 1.4, p: WHIGH, x: 725 },
  { t: 1.78, p: SDOWN, x: 586, e: 'out' },
  { t: 2.15, p: SDOWN, x: 588 },
  { t: 2.6, p: GE, x: 620 },
  { t: 2.85, p: PARRY, x: 612 },
  { t: 3.08, p: PARRY, x: 580, e: 'out' },
  { t: 3.4, p: PARRY, x: 582 },
  { t: 3.75, p: GE, x: 640 },
  { t: 3.95, p: CROUCH, x: 640 },
  { t: 4.05, p: TAKEOFF, x: 612, e: 'out' },
  { t: 4.25, p: APEX, x: 470, e: 'lin' },
  { t: 4.5, p: DIVE, x: 320, e: 'lin' },
  { t: 4.68, p: LAND, x: 226 },
  { t: 4.8, p: r360(SDOWN), x: 215, e: 'out' },
  { t: 5.0, p: r360(PARRY), x: 215, e: 'out' },
  { t: 5.2, p: r360(SDOWN), x: 218 },
  { t: 5.35, p: r360(PARRY), x: 215, e: 'out' },
  { t: 5.5, p: r360(SLASH_H), x: 218 },
  { t: 5.65, p: r360(PARRY), x: 215, e: 'out' },
  { t: 5.95, p: r360(GE), x: 205 },
  { t: 6.2, p: r360(WHIGH), x: 205 },
  { t: 6.45, p: r360(SDOWN), x: 298, e: 'out' },
  { t: 6.62, p: r360(SDOWN), x: 300 },
  { t: 6.9, p: r360(STAGGER), x: 285, e: 'out' },
  { t: 7.3, p: r360(STAGGER), x: 270 },
  { t: 7.7, p: r360(KNEEL), x: 262 },
  { t: 8.5, p: r360(KNEEL), x: 262 },
  { t: 8.95, p: LIE, x: 232, e: 'in' },
  { t: 10.8, p: LIE, x: 232 },
]);

// ---- scenery ------------------------------------------------------------
let SKY: HTMLCanvasElement | null = null;
function sky() {
  if (SKY) return SKY;
  SKY = offscreen(W + 80, H, (c) => {
    const g = c.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, '#02060f'); g.addColorStop(0.5, '#0b2037'); g.addColorStop(1, '#1d4a58');
    c.fillStyle = g; c.fillRect(0, 0, W + 80, H);
    const r = rng(9);
    for (let i = 0; i < 110; i++) { c.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.6})`; c.fillRect(r() * W, r() * 260, 1.4, 1.4); }
    // moon
    const mg = c.createRadialGradient(720, 150, 20, 720, 150, 260);
    mg.addColorStop(0, 'rgba(190,240,255,0.55)'); mg.addColorStop(1, 'rgba(190,240,255,0)');
    c.fillStyle = mg; c.fillRect(380, -100, 700, 500);
    c.shadowColor = '#bfeaff'; c.shadowBlur = 50;
    c.fillStyle = '#f2fbff'; c.beginPath(); c.arc(720, 150, 78, 0, Math.PI * 2); c.fill();
    c.shadowBlur = 0;
    c.fillStyle = 'rgba(150,190,215,0.35)';
    c.beginPath(); c.arc(700, 132, 14, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(745, 170, 10, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(736, 122, 7, 0, Math.PI * 2); c.fill();
    // clouds
    for (let i = 0; i < 6; i++) {
      c.fillStyle = 'rgba(120,170,200,0.10)';
      c.beginPath(); c.ellipse(100 + i * 180 + r() * 40, 90 + r() * 140, 130 + r() * 60, 12 + r() * 8, 0, 0, Math.PI * 2); c.fill();
    }
    // mountains
    const mt = (base: number, amp: number, col: string, seed: number) => {
      const rr = rng(seed);
      c.fillStyle = col; c.beginPath(); c.moveTo(0, GY);
      let x = 0, y = base;
      while (x <= W + 80) { y = base - rr() * amp; c.lineTo(x, y); x += 40 + rr() * 60; }
      c.lineTo(W + 80, GY); c.closePath(); c.fill();
    };
    mt(330, 120, '#12303f', 4); mt(370, 90, '#0b2230', 8);
    // pagoda silhouette
    c.fillStyle = '#071722';
    const px = 170, py = GY - 6;
    for (let i = 0; i < 4; i++) {
      const w = 90 - i * 14, yy = py - 40 - i * 36;
      c.beginPath(); c.moveTo(px - w, yy); c.lineTo(px + w, yy); c.lineTo(px + w - 18, yy - 12); c.lineTo(px - w + 18, yy - 12); c.closePath(); c.fill();
      c.fillRect(px - w + 22, yy, w * 2 - 44, 26);
    }
    c.fillRect(px - 4, py - 40 - 4 * 36 - 24, 8, 24);
    // distant bamboo grove
    for (let i = 0; i < 46; i++) {
      const bx = r() * (W + 80), bw = 4 + r() * 3, top = 120 + r() * 160;
      c.fillStyle = `rgba(${10 + r() * 14},${48 + r() * 30},${52 + r() * 24},0.9)`;
      c.fillRect(bx, top, bw, GY - top);
      c.fillStyle = 'rgba(0,0,0,0.25)';
      for (let y = top + 20; y < GY; y += 36) c.fillRect(bx - 1, y, bw + 2, 2);
    }
    // ground
    const fg = c.createLinearGradient(0, GY, 0, H);
    fg.addColorStop(0, '#273d46'); fg.addColorStop(0.12, '#15262e'); fg.addColorStop(1, '#050b10');
    c.fillStyle = fg; c.fillRect(0, GY, W + 80, H - GY);
    // moon reflection on floor
    const rg = c.createRadialGradient(720, GY + 6, 4, 720, GY + 6, 260);
    rg.addColorStop(0, 'rgba(190,240,255,0.35)'); rg.addColorStop(1, 'rgba(190,240,255,0)');
    c.save(); c.translate(0, GY); c.scale(1, 0.2); c.translate(0, -GY);
    c.fillStyle = rg; c.fillRect(300, GY - 260, 900, 520); c.restore();
    // flagstone lines
    c.strokeStyle = 'rgba(160,210,230,0.10)'; c.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const y = GY + 8 + i * i * 1.9 + i * 4;
      c.beginPath(); c.moveTo(0, y); c.lineTo(W + 80, y); c.stroke();
    }
    for (let i = -6; i < 22; i++) {
      c.beginPath(); c.moveTo(i * 60, GY + 8); c.lineTo(W / 2 + (i * 60 - W / 2) * 2.6, H); c.stroke();
    }
    c.fillStyle = 'rgba(190,240,255,0.55)'; c.fillRect(0, GY - 1, W + 80, 2);
  });
  return SKY;
}

interface Petal { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number }
let petals: Petal[] = [];
const pr = rng(77);
function initPetals() {
  petals = Array.from({ length: 36 }, () => ({ x: pr() * W, y: pr() * H, vx: -20 - pr() * 40, vy: 20 + pr() * 40, r: pr() * 6, vr: (pr() - 0.5) * 5, s: 3 + pr() * 4 }));
}

function stalk(ctx: CanvasRenderingContext2D, x: number, time: number, w: number, col: string) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, H + 10);
  const segs = 14;
  let px = x, py = H + 10;
  const pts: [number, number][] = [];
  for (let i = 1; i <= segs; i++) {
    const y = H + 10 - i * 52;
    px = x + Math.sin(time * 0.9 + i * 0.4 + x) * i * 1.6 + i * i * 0.35 * (x < W / 2 ? 1 : -1);
    ctx.lineTo(px, y); pts.push([px, y]); py = y;
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (const [qx, qy] of pts) ctx.fillRect(qx - w / 2 - 1, qy, w + 2, 3);
  // leaves
  ctx.fillStyle = col;
  for (let i = 4; i < pts.length; i += 2) {
    const [qx, qy] = pts[i];
    const dir = i % 4 === 0 ? 1 : -1;
    ctx.save(); ctx.translate(qx, qy); ctx.rotate(dir * (0.9 + Math.sin(time * 1.5 + i) * 0.15));
    ctx.beginPath(); ctx.ellipse(dir * 26, 0, 30, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  void py;
}

const cfg: DuelCfg = {
  len: 10.8,
  ground: GY,
  hero: { tr: heroTr, style: HERO, sword: true, face: 1 },
  foe: { tr: foeTr, style: FOE, sword: true, face: -1 },
  events: [
    { t: 1.55, k: 'dash' },
    { t: 1.82, k: 'clash', text: 'CLASH!' },
    { t: 3.12, k: 'clash', text: 'PARRY!' },
    { t: 4.05, k: 'leap' },
    { t: 4.72, k: 'land' },
    { t: 5.0, k: 'clash' },
    { t: 5.35, k: 'clash', text: 'FLURRY!' },
    { t: 5.65, k: 'clash' },
    { t: 6.6, k: 'finish', text: 'IAI SLASH!' },
    { t: 8.95, k: 'fall' },
  ],
  slow: [
    { t: 1.82, w: 0.25, s: 0.3 }, { t: 3.12, w: 0.25, s: 0.3 }, { t: 5.0, w: 0.2, s: 0.35 },
    { t: 5.35, w: 0.2, s: 0.35 }, { t: 5.65, w: 0.25, s: 0.3 }, { t: 6.6, w: 0.45, s: 0.1 }, { t: 4.4, w: 0.4, s: 0.55 },
  ],
  lock: [[6.5, 10.8]],
  label: (T) =>
    T < 1.3 ? 'THE STANDOFF' : T < 2.6 ? 'FIRST CLASH' : T < 3.7 ? 'OVERHEAD STRIKE' : T < 4.8 ? 'LEAPING ASSAULT' : T < 6.0 ? 'BLADE FLURRY' : T < 7.4 ? 'IAI DASH FINISHER' : 'VICTORY',
  bg: (ctx, s) => {
    ctx.drawImage(sky(), -40, 0);
    const t = s.real;
    // rolling mist
    for (let i = 0; i < 3; i++) {
      const g = ctx.createLinearGradient(0, GY - 70, 0, GY + 20);
      g.addColorStop(0, 'rgba(160,210,230,0)'); g.addColorStop(1, 'rgba(160,210,230,0.16)');
      ctx.fillStyle = g;
      const ox = ((t * (10 + i * 7) + i * 330) % (W + 400)) - 200;
      ctx.beginPath(); ctx.ellipse(ox, GY - 5, 380, 60, 0, 0, Math.PI * 2); ctx.fill();
    }
  },
  front: (ctx, s) => {
    const t = s.real;
    // foreground bamboo
    stalk(ctx, 18, t, 18, '#04120f');
    stalk(ctx, 74, t + 1.3, 9, '#07211c');
    stalk(ctx, 966, t + 2.1, 20, '#04120f');
    stalk(ctx, 912, t + 3.4, 10, '#07211c');
    // petals
    for (const p of petals) {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = 'rgba(255,170,200,0.85)';
      ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  },
  onReset: () => initPetals(),
  onUpdate: (dt) => {
    for (const p of petals) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      if (p.y > H + 10 || p.x < -10) { p.x = W + pr() * 200; p.y = -10 - pr() * 100; }
    }
  },
  cam: (T) => 0.1 * smooth(bump(T - 6.8, 0.9)),
  onEvent: (e, s) => {
    const fx = s.fx;
    const g = s.cfg.ground;
    if (e.k === 'clash') {
      const [x, y] = s.clash;
      fx.impact(x, y, '#ffe9a8', 1.2, -Math.PI / 2);
      fx.spark(x, y, 14, '#8ff3ff', 600, -Math.PI / 2, Math.PI);
      fx.spark(x, y, 14, '#ff8a9a', 600, -Math.PI / 2, Math.PI);
      if (e.text) fx.text(x, y - 60, e.text, '#ffe9a8', 38);
    } else if (e.k === 'dash') {
      fx.dust(s.hero.x, g, 10, 'rgba(180,220,235,0.4)', 90);
      fx.dust(s.foe.x, g, 10, 'rgba(180,220,235,0.4)', 90);
      fx.ring(s.hero.x, g, '#6fd6ff', 80, 0.4, 3);
      fx.ring(s.foe.x, g, '#ff2e55', 80, 0.4, 3);
    } else if (e.k === 'leap') {
      fx.dust(s.foe.x, g, 12, 'rgba(180,220,235,0.45)', 100);
      fx.ring(s.foe.x, g, '#ff2e55', 90, 0.45, 4);
      fx.text(s.foe.x - 20, g - 220, 'LEAP!', '#ff5468', 34);
    } else if (e.k === 'land') {
      fx.dust(s.foe.x, g, 16, 'rgba(180,220,235,0.5)', 130);
      fx.ring(s.foe.x, g, '#ff2e55', 120, 0.45, 5);
      fx.shake = 6;
    } else if (e.k === 'finish') {
      const f = s.foe;
      fx.slash([f.x - 190, g - 230], [f.x + 170, g - 20], '#ffffff', 14);
      fx.slash([f.x - 160, g - 40], [f.x + 190, g - 200], '#6fd6ff', 7);
      fx.impact(f.x, g - 100, '#ffffff', 2.4, 0);
      fx.spark(f.x, g - 100, 40, '#ff2e55', 800, 0, Math.PI * 2);
      fx.flash = 0.7; fx.flashColor = '#ffffff';
      fx.shake = 16; fx.zoom = 0.08;
      fx.text(f.x + 40, g - 250, e.text ?? '', '#ffffff', 52);
      fx.dust(s.hero.x + 80, g, 16, 'rgba(180,220,235,0.5)', 160);
    } else if (e.k === 'fall') {
      fx.dust(s.foe.x, g, 14, 'rgba(180,220,235,0.45)', 100);
      fx.ring(s.foe.x, g, '#ff2e55', 100, 0.5, 4);
      fx.shake = 5;
      fx.text(s.foe.x + 60, g - 120, 'K.O.', '#ffd23d', 44);
    }
  },
};

export class SwordScene extends DuelScene {
  constructor() { super(cfg); }
}
