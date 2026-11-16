// A tiny skeletal animation engine: poses -> joints -> neon figure drawing.
export type Vec = [number, number];

export interface Pose {
  y: number; // lift above ground (snap=1) or absolute hip height (snap=0)
  rot: number; // whole body rotation, degrees, clockwise (front flip = +)
  tor: number; // torso lean from vertical (+ forward)
  hd: number; // head tilt
  a1u: number; a1l: number; // near arm (upper / lower), degrees from "down", + forward
  a2u: number; a2l: number; // far arm
  l1u: number; l1l: number; // near leg (thigh / shin)
  l2u: number; l2l: number; // far leg
  sw: number; // sword angle relative to forearm
  snap: number; // 1 = feet stick to ground, 0 = free hip height
}

export const BASE: Pose = {
  y: 0, rot: 0, tor: 0, hd: 0,
  a1u: 8, a1l: 25, a2u: -6, a2l: 18,
  l1u: 0, l1l: 0, l2u: 0, l2l: 0,
  sw: 0, snap: 1,
};
export const KEYS = Object.keys(BASE) as (keyof Pose)[];
export const P = (o: Partial<Pose> = {}): Pose => ({ ...BASE, ...o });

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const bump = (d: number, w: number) => Math.max(0, 1 - Math.abs(d) / w);

export type EaseName = 'io' | 'out' | 'in' | 'lin' | 'back';
export const EASE: Record<EaseName, (t: number) => number> = {
  io: smooth,
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  lin: (t) => t,
  back: (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const o = {} as Pose;
  for (const k of KEYS) o[k] = lerp(a[k], b[k], t);
  return o;
}

export interface KF { t: number; p: Pose; x?: number; e?: EaseName }

/** Build a track; missing x carries over from previous keyframe. */
export function track(list: KF[]): Required<KF>[] {
  let x = 0;
  return list.map((k) => {
    if (k.x !== undefined) x = k.x;
    return { t: k.t, p: k.p, x, e: k.e ?? 'io' };
  });
}

export function sample(tr: Required<KF>[], t: number): { p: Pose; x: number } {
  if (t <= tr[0].t) return { p: tr[0].p, x: tr[0].x };
  const last = tr[tr.length - 1];
  if (t >= last.t) return { p: last.p, x: last.x };
  let i = 0;
  while (i < tr.length - 2 && t >= tr[i + 1].t) i++;
  const a = tr[i], b = tr[i + 1];
  const u = EASE[b.e]((t - a.t) / (b.t - a.t));
  return { p: lerpPose(a.p, b.p, u), x: lerp(a.x, b.x, u) };
}

export const DIM = { torso: 50, head: 10, uarm: 27, larm: 26, thigh: 33, shin: 33 };
const RAD = Math.PI / 180;
const down = (deg: number, len: number): Vec => [Math.sin(deg * RAD) * len, Math.cos(deg * RAD) * len];
const up = (deg: number, len: number): Vec => [Math.sin(deg * RAD) * len, -Math.cos(deg * RAD) * len];
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];

export interface Skel {
  face: number;
  rot: number; // radians
  hip: Vec; neck: Vec; head: Vec;
  e1: Vec; h1: Vec; e2: Vec; h2: Vec;
  k1: Vec; f1: Vec; k2: Vec; f2: Vec;
  sw: number; // sword world angle (rad)
  swBase: Vec; swTip: Vec;
  swLen: number;
}

export function solve(p: Pose, x: number, ground: number, face: number, swLen = 92): Skel {
  const rel: Record<string, Vec> = {};
  const neck = up(p.tor, DIM.torso);
  rel.neck = neck;
  rel.head = add(neck, up(p.tor + p.hd, DIM.head + 6));
  rel.e1 = add(neck, down(p.a1u, DIM.uarm));
  rel.h1 = add(rel.e1, down(p.a1l, DIM.larm));
  rel.e2 = add(neck, down(p.a2u, DIM.uarm));
  rel.h2 = add(rel.e2, down(p.a2l, DIM.larm));
  rel.k1 = down(p.l1u, DIM.thigh);
  rel.f1 = add(rel.k1, down(p.l1l, DIM.shin));
  rel.k2 = down(p.l2u, DIM.thigh);
  rel.f2 = add(rel.k2, down(p.l2l, DIM.shin));
  const c = Math.cos(p.rot * RAD), s = Math.sin(p.rot * RAD);
  let maxY = 0;
  const rr: Record<string, Vec> = {};
  for (const k in rel) {
    const [vx, vy] = rel[k];
    const r: Vec = [vx * c - vy * s, vx * s + vy * c];
    rr[k] = r;
    const pad = k === 'head' ? 10 : k[0] === 'f' ? 4 : k[0] === 'h' ? 3 : 0;
    if (r[1] + pad > maxY) maxY = r[1] + pad;
  }
  const hipY = ground - p.y - p.snap * maxY;
  const W = (k: string): Vec => [x + face * rr[k][0], hipY + rr[k][1]];
  const sk: Skel = {
    face, rot: p.rot * RAD,
    hip: [x, hipY], neck: W('neck'), head: W('head'),
    e1: W('e1'), h1: W('h1'), e2: W('e2'), h2: W('h2'),
    k1: W('k1'), f1: W('f1'), k2: W('k2'), f2: W('f2'),
    sw: 0, swBase: [0, 0], swTip: [0, 0], swLen,
  };
  const th = (p.a1l + p.sw - p.rot) * RAD;
  setSword(sk, Math.atan2(Math.cos(th), face * Math.sin(th)));
  return sk;
}

export function setSword(sk: Skel, ang: number) {
  sk.sw = ang;
  const d: Vec = [Math.cos(ang), Math.sin(ang)];
  sk.swBase = [sk.h1[0] - d[0] * 12, sk.h1[1] - d[1] * 12];
  sk.swTip = [sk.h1[0] + d[0] * sk.swLen, sk.h1[1] + d[1] * sk.swLen];
}

export const angLerp = (a: number, b: number, t: number) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * t;
};

/** Point at which two swords cross when they clash (above the midpoint of the hands). */
export function aimSword(sk: Skel, target: Vec, w: number) {
  if (w <= 0) return;
  const want = Math.atan2(target[1] - sk.h1[1], target[0] - sk.h1[0]);
  setSword(sk, angLerp(sk.sw, want, w));
}

export interface Style {
  color: string; dark: string; glow: string; accent: string; blade?: string;
}

function limb(ctx: CanvasRenderingContext2D, pts: Vec[], w: number, st: Style, col: string, glow: boolean, alpha: number) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (glow) { ctx.shadowColor = st.glow; ctx.shadowBlur = 16; }
  ctx.strokeStyle = '#05050c'; ctx.lineWidth = w + 4; ctx.globalAlpha = alpha; ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawFigure(ctx: CanvasRenderingContext2D, s: Skel, st: Style, o: { sword?: boolean; alpha?: number; glow?: boolean } = {}) {
  const alpha = o.alpha ?? 1, glow = o.glow ?? true;
  const foot = (f: Vec): Vec => [f[0] + s.face * Math.cos(s.rot) * 8, f[1] + Math.sin(s.rot) * 8 * s.face * s.face];
  ctx.save();
  // far arm + far leg
  limb(ctx, [s.neck, s.e2, s.h2], 6, st, st.dark, glow, alpha);
  limb(ctx, [s.hip, s.k2, s.f2, foot(s.f2)], 8, st, st.dark, glow, alpha);
  // torso
  limb(ctx, [s.hip, s.neck], 12, st, st.color, glow, alpha);
  // belt / sash
  ctx.globalAlpha = alpha;
  const bx = s.hip[0] + (s.neck[0] - s.hip[0]) * 0.06, by = s.hip[1] + (s.neck[1] - s.hip[1]) * 0.06;
  ctx.fillStyle = st.accent;
  ctx.beginPath(); ctx.arc(bx, by, 6.5, 0, Math.PI * 2); ctx.fill();
  // near leg
  limb(ctx, [s.hip, s.k1, s.f1, foot(s.f1)], 9, st, st.color, glow, alpha);
  // head
  ctx.globalAlpha = alpha;
  if (glow) { ctx.shadowColor = st.glow; ctx.shadowBlur = 16; }
  ctx.fillStyle = '#05050c';
  ctx.beginPath(); ctx.arc(s.head[0], s.head[1], DIM.head + 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = st.color;
  ctx.beginPath(); ctx.arc(s.head[0], s.head[1], DIM.head, 0, Math.PI * 2); ctx.fill();
  // headband
  ctx.strokeStyle = st.accent; ctx.lineWidth = 4;
  ctx.beginPath();
  const hr = DIM.head - 1;
  ctx.arc(s.head[0], s.head[1], hr, s.rot - 2.6, s.rot - 0.5 + (s.face < 0 ? 0 : 0));
  ctx.stroke();
  // eye slit
  ctx.fillStyle = '#fff';
  ctx.save();
  ctx.translate(s.head[0], s.head[1]); ctx.rotate(s.face * s.rot);
  ctx.fillRect(s.face > 0 ? 1 : -9, -1.5, 8, 3);
  ctx.restore();
  // near arm
  limb(ctx, [s.neck, s.e1, s.h1], 7, st, st.color, glow, alpha);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = st.accent;
  ctx.beginPath(); ctx.arc(s.h1[0], s.h1[1], 4.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s.h2[0], s.h2[1], 3.6, 0, Math.PI * 2); ctx.fill();
  if (o.sword) drawSword(ctx, s, st, alpha, glow);
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function drawSword(ctx: CanvasRenderingContext2D, s: Skel, st: Style, alpha = 1, glow = true) {
  const [bx, by] = s.swBase, [tx, ty] = s.swTip;
  const dx = Math.cos(s.sw), dy = Math.sin(s.sw);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  // handle
  ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + dx * 22, by + dy * 22); ctx.stroke();
  // guard
  const gx = bx + dx * 22, gy = by + dy * 22;
  ctx.strokeStyle = st.accent; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(gx - dy * 7, gy + dx * 7); ctx.lineTo(gx + dy * 7, gy - dx * 7); ctx.stroke();
  // blade
  if (glow) { ctx.shadowColor = st.blade ?? st.glow; ctx.shadowBlur = 18; }
  const g = ctx.createLinearGradient(gx, gy, tx, ty);
  g.addColorStop(0, '#cfd8e6'); g.addColorStop(0.7, '#ffffff'); g.addColorStop(1, st.blade ?? '#aef');
  ctx.strokeStyle = g; ctx.lineWidth = 3.2;
  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.restore();
}

/** Flowing headband tail that trails behind the head. */
export class Ribbon {
  pts: Vec[] = [];
  n = 9;
  seg = 6.5;
  t = 0;
  reset(at: Vec) { this.pts = Array.from({ length: this.n }, () => [at[0], at[1]] as Vec); }
  update(dt: number, anchor: Vec, face: number) {
    this.t += dt;
    if (!this.pts.length) this.reset(anchor);
    this.pts[0] = [anchor[0] - face * 8, anchor[1] - 2];
    for (let i = 1; i < this.n; i++) {
      const a = this.pts[i - 1], b = this.pts[i];
      let vx = b[0] - a[0] - face * 2.2;
      let vy = b[1] - a[1] + 0.6 + Math.sin(this.t * 9 + i * 0.9) * 0.9;
      const l = Math.hypot(vx, vy) || 1;
      this.pts[i] = [a[0] + (vx / l) * this.seg, a[1] + (vy / l) * this.seg];
    }
  }
  draw(ctx: CanvasRenderingContext2D, color: string, alpha = 1) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.shadowColor = color; ctx.shadowBlur = 10;
    ctx.strokeStyle = color; ctx.globalAlpha = alpha;
    for (let i = 1; i < this.n; i++) {
      ctx.lineWidth = 5 * (1 - i / this.n) + 0.8;
      ctx.beginPath();
      ctx.moveTo(this.pts[i - 1][0], this.pts[i - 1][1]);
      ctx.lineTo(this.pts[i][0], this.pts[i][1]);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** Fading ghost frames for motion afterimages. */
export class Ghosts {
  list: { s: Skel; life: number }[] = [];
  acc = 0;
  update(dt: number, s: Skel | null, active: boolean, every = 0.045) {
    this.acc += dt;
    if (s && active && this.acc >= every) {
      this.acc = 0;
      this.list.push({ s: JSON.parse(JSON.stringify(s)), life: 1 });
      if (this.list.length > 8) this.list.shift();
    }
    for (const g of this.list) g.life -= dt * 4;
    this.list = this.list.filter((g) => g.life > 0);
  }
  draw(ctx: CanvasRenderingContext2D, st: Style, sword = false) {
    for (const g of this.list) {
      drawFigure(ctx, g.s, { ...st, dark: st.color }, { alpha: g.life * 0.28, glow: false, sword });
    }
  }
  clear() { this.list = []; }
}

/** Fading sword swoosh. */
export class SwordTrail {
  pts: { b: Vec; t: Vec }[] = [];
  update(s: Skel) {
    const m: Vec = [s.swBase[0] + (s.swTip[0] - s.swBase[0]) * 0.35, s.swBase[1] + (s.swTip[1] - s.swBase[1]) * 0.35];
    this.pts.push({ b: m, t: [s.swTip[0], s.swTip[1]] });
    if (this.pts.length > 12) this.pts.shift();
  }
  decay() { if (this.pts.length) this.pts.shift(); }
  clear() { this.pts = []; }
  draw(ctx: CanvasRenderingContext2D, color: string) {
    const n = this.pts.length;
    if (n < 2) return;
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 14;
    for (let i = 1; i < n; i++) {
      const a = this.pts[i - 1], b = this.pts[i];
      const k = i / n;
      ctx.globalAlpha = k * 0.55;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(a.b[0], a.b[1]); ctx.lineTo(a.t[0], a.t[1]); ctx.lineTo(b.t[0], b.t[1]); ctx.lineTo(b.b[0], b.b[1]);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}
