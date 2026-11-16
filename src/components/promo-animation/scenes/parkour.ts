import { FX, H, W, Scene, offscreen, rng, vignette } from '../engine/fx';
import { Ghosts, KF, P, Pose, Ribbon, Style, clamp, drawFigure, lerp, lerpPose, sample, smooth, solve, track, Skel } from '../engine/rig';

const GY = 440; // ground line
const CX = 330; // runner screen x

const HERO: Style = { color: '#2ef2ff', dark: '#1a86a8', glow: '#2ef2ff', accent: '#ff3d81' };

function runPose(ph: number): Pose {
  const s = Math.sin(ph), c = Math.cos(ph);
  const l1u = 56 * s, l2u = -56 * s;
  const a1u = -52 * s, a2u = 52 * s;
  return P({
    tor: 19,
    l1u, l1l: l1u - (18 + 80 * Math.max(0, c)),
    l2u, l2l: l2u - (18 + 80 * Math.max(0, -c)),
    a1u, a1l: a1u + 85, a2u, a2l: a2u + 85,
  });
}
const R1 = runPose(1.0), R2 = runPose(3.9);

type Ev = { t: number; k: 'jump' | 'land' | 'impact' };
interface Seg {
  name: string; d: number; kind: string;
  tr?: Required<KF>[];
  sp: [number, number][];
  ev?: Ev[];
  color?: string;
}

const run = (d: number, v = 430): Seg => ({ name: 'SPRINT', d, kind: 'run', sp: [[0, v], [d, v]] });

const SEGS: Seg[] = [
  run(1.3),
  {
    name: 'SPEED VAULT', d: 1.0, kind: 'vault', color: '#2ef2ff',
    sp: [[0, 430], [1, 410]],
    ev: [{ t: 0.28, k: 'jump' }, { t: 0.78, k: 'land' }],
    tr: track([
      { t: 0, p: R1 },
      { t: 0.15, p: P({ tor: 30, l1u: 70, l1l: 0, l2u: -20, l2l: -80, a1u: 100, a1l: 110, a2u: 90, a2l: 100 }) },
      { t: 0.28, p: P({ snap: 0, y: 68, tor: 45, a1u: 25, a1l: 25, a2u: 20, a2l: 20, l1u: 105, l1l: 70, l2u: 100, l2l: 90 }), e: 'out' },
      { t: 0.42, p: P({ snap: 0, y: 74, tor: 40, a1u: 5, a1l: 5, a2u: 2, a2l: 2, l1u: 115, l1l: 95, l2u: 100, l2l: 95 }) },
      { t: 0.55, p: P({ snap: 0, y: 102, tor: 30, a1u: -60, a1l: -40, a2u: -55, a2l: -35, l1u: 85, l1l: 45, l2u: 70, l2l: 10 }) },
      { t: 0.78, p: P({ snap: 1, y: 0, tor: 30, a1u: -30, a1l: 20, a2u: -40, a2l: 10, l1u: 50, l1l: -30, l2u: -10, l2l: -60 }), e: 'in' },
      { t: 1.0, p: R2 },
    ]),
  },
  run(0.7),
  {
    name: 'WALL CLIMB', d: 2.0, kind: 'wall', color: '#ff3d81',
    sp: [[0, 430], [0.3, 430], [0.52, 0], [1.35, 0], [1.5, 300], [1.8, 380], [2, 420]],
    ev: [{ t: 0.3, k: 'jump' }, { t: 0.52, k: 'impact' }, { t: 1.8, k: 'land' }],
    tr: track([
      { t: 0, p: R1 },
      { t: 0.28, p: P({ tor: 28, l1u: 60, l1l: -30, l2u: 20, l2l: -50, a1u: -50, a1l: -20, a2u: -40, a2l: -10 }) },
      { t: 0.46, p: P({ snap: 0, y: 80, tor: 15, a1u: 140, a1l: 155, a2u: 130, a2l: 150, l1u: 90, l1l: 15, l2u: 60, l2l: -10 }), e: 'out' },
      { t: 0.62, p: P({ snap: 0, y: 43, tor: 12, a1u: 150, a1l: 160, a2u: 145, a2l: 158, l1u: 85, l1l: 5, l2u: 60, l2l: -10 }), e: 'out' },
      { t: 0.95, p: P({ snap: 0, y: 42, tor: 8, a1u: 152, a1l: 162, a2u: 148, a2l: 160, l1u: 98, l1l: 10, l2u: 72, l2l: 0 }) },
      { t: 1.15, p: P({ snap: 0, y: 118, tor: 25, a1u: -20, a1l: 130, a2u: -15, a2l: 125, l1u: 60, l1l: 10, l2u: 40, l2l: -20 }), e: 'out' },
      { t: 1.35, p: P({ snap: 0, y: 152, tor: 35, a1u: 5, a1l: 5, a2u: 2, a2l: 2, l1u: 30, l1l: -60, l2u: -40, l2l: -90 }) },
      { t: 1.5, p: P({ snap: 0, y: 174, tor: 15, a1u: -50, a1l: -30, a2u: -45, a2l: -25, l1u: 95, l1l: 40, l2u: 80, l2l: 20 }), e: 'out' },
      { t: 1.8, p: P({ snap: 1, y: 0, tor: 30, a1u: 40, a1l: 60, a2u: 30, a2l: 50, l1u: 60, l1l: -40, l2u: 20, l2l: -70 }), e: 'in' },
      { t: 2.0, p: R2 },
    ]),
  },
  run(0.6),
  {
    name: 'GAP FRONT FLIP', d: 1.3, kind: 'flip', color: '#ffd23d',
    sp: [[0, 430], [1.3, 430]],
    ev: [{ t: 0.3, k: 'jump' }, { t: 0.97, k: 'land' }],
    tr: track([
      { t: 0, p: R1 },
      { t: 0.16, p: P({ tor: 35, l1u: 60, l1l: -50, l2u: 45, l2l: -60, a1u: -70, a1l: -40, a2u: -60, a2l: -30 }) },
      { t: 0.3, p: P({ snap: 0, y: 72, tor: 5, a1u: 170, a1l: 175, a2u: 165, a2l: 172, l1u: 5, l1l: 0, l2u: -5, l2l: -5 }), e: 'out' },
      { t: 0.44, p: P({ snap: 0, y: 125, rot: 110, tor: 25, a1u: 70, a1l: 125, a2u: 65, a2l: 120, l1u: 112, l1l: -10, l2u: 105, l2l: -20 }), e: 'out' },
      { t: 0.64, p: P({ snap: 0, y: 170, rot: 225, tor: 28, a1u: 70, a1l: 125, a2u: 65, a2l: 120, l1u: 112, l1l: -10, l2u: 105, l2l: -20 }), e: 'lin' },
      { t: 0.82, p: P({ snap: 0, y: 125, rot: 335, tor: 15, a1u: 110, a1l: 100, a2u: 105, a2l: 95, l1u: 70, l1l: 30, l2u: 55, l2l: 10 }), e: 'lin' },
      { t: 0.94, p: P({ snap: 0, y: 78, rot: 360, tor: 10, a1u: 120, a1l: 120, a2u: 115, a2l: 115, l1u: 30, l1l: 0, l2u: 10, l2l: -10 }) },
      { t: 1.02, p: P({ snap: 1, y: 0, rot: 360, tor: 42, a1u: 80, a1l: 70, a2u: 70, a2l: 60, l1u: 70, l1l: -60, l2u: 40, l2l: -75 }), e: 'out' },
      { t: 1.3, p: { ...R2, rot: 360 } },
    ]),
  },
  {
    name: 'DIVE ROLL', d: 0.8, kind: 'roll', color: '#7dff6b',
    sp: [[0, 330], [0.8, 400]],
    ev: [{ t: 0.12, k: 'land' }, { t: 0.7, k: 'land' }],
    tr: track([
      { t: 0, p: P({ rot: 360, tor: 42, a1u: 80, a1l: 70, a2u: 70, a2l: 60, l1u: 70, l1l: -60, l2u: 40, l2l: -75 }) },
      { t: 0.12, p: P({ snap: 0, y: 46, rot: 400, tor: 40, a1u: 130, a1l: 120, a2u: 120, a2l: 110, l1u: -30, l1l: -60, l2u: -40, l2l: -70 }), e: 'out' },
      { t: 0.28, p: P({ snap: 0, y: 42, rot: 500, tor: 72, a1u: 110, a1l: 140, a2u: 105, a2l: 135, l1u: 120, l1l: 10, l2u: 115, l2l: 5 }), e: 'lin' },
      { t: 0.46, p: P({ snap: 0, y: 42, rot: 610, tor: 72, a1u: 110, a1l: 140, a2u: 105, a2l: 135, l1u: 120, l1l: 10, l2u: 115, l2l: 5 }), e: 'lin' },
      { t: 0.62, p: P({ snap: 0, y: 46, rot: 705, tor: 55, a1u: 90, a1l: 110, a2u: 85, a2l: 105, l1u: 100, l1l: 20, l2u: 90, l2l: 10 }) },
      { t: 0.72, p: P({ snap: 1, y: 0, rot: 720, tor: 32, a1u: 60, a1l: 70, a2u: 50, a2l: 60, l1u: 65, l1l: -55, l2u: 30, l2l: -70 }), e: 'out' },
      { t: 0.8, p: { ...R1, rot: 720 } },
    ]),
  },
  run(0.6),
  {
    name: 'POWER SLIDE', d: 1.0, kind: 'slide', color: '#ff9a3d',
    sp: [[0, 440], [0.3, 440], [0.78, 300], [1, 420]],
    tr: track([
      { t: 0, p: R1 },
      { t: 0.14, p: P({ snap: 0, y: 44, rot: -35, tor: 15, a1u: -60, a1l: -30, a2u: 80, a2l: 100, l1u: 40, l1l: 0, l2u: 20, l2l: -60 }), e: 'out' },
      { t: 0.28, p: P({ snap: 0, y: 19, rot: -75, tor: -5, a1u: -100, a1l: -95, a2u: 170, a2l: 175, l1u: 0, l1l: 0, l2u: 25, l2l: -70 }), e: 'out' },
      { t: 0.7, p: P({ snap: 0, y: 19, rot: -76, tor: -3, a1u: -104, a1l: -100, a2u: 165, a2l: 170, l1u: 0, l1l: 0, l2u: 28, l2l: -72 }) },
      { t: 0.86, p: P({ snap: 0, y: 52, rot: -25, tor: 25, a1u: 60, a1l: 80, a2u: 40, a2l: 70, l1u: 60, l1l: -30, l2u: -20, l2l: -80 }), e: 'out' },
      { t: 1.0, p: R2 },
    ]),
  },
  run(0.6),
  {
    name: 'BACKFLIP', d: 1.3, kind: 'back', color: '#c77dff',
    sp: [[0, 400], [1.3, 380]],
    ev: [{ t: 0.3, k: 'jump' }, { t: 1.04, k: 'land' }],
    tr: track([
      { t: 0, p: R1 },
      { t: 0.15, p: P({ tor: 8, l1u: 50, l1l: -60, l2u: 40, l2l: -60, a1u: -60, a1l: -40, a2u: -55, a2l: -35 }) },
      { t: 0.3, p: P({ snap: 0, y: 78, rot: -15, tor: -5, a1u: 170, a1l: 175, a2u: 165, a2l: 172, l1u: -5, l1l: -10, l2u: -10, l2l: -10 }), e: 'out' },
      { t: 0.46, p: P({ snap: 0, y: 140, rot: -125, tor: 22, a1u: 70, a1l: 125, a2u: 65, a2l: 120, l1u: 112, l1l: -10, l2u: 105, l2l: -20 }), e: 'out' },
      { t: 0.66, p: P({ snap: 0, y: 178, rot: -235, tor: 28, a1u: 70, a1l: 125, a2u: 65, a2l: 120, l1u: 112, l1l: -10, l2u: 105, l2l: -20 }), e: 'lin' },
      { t: 0.86, p: P({ snap: 0, y: 125, rot: -335, tor: 12, a1u: 110, a1l: 100, a2u: 105, a2l: 95, l1u: 60, l1l: 20, l2u: 45, l2l: 0 }), e: 'lin' },
      { t: 0.98, p: P({ snap: 0, y: 76, rot: -360, tor: 8, a1u: 130, a1l: 130, a2u: 125, a2l: 125, l1u: 15, l1l: 0, l2u: 5, l2l: -5 }) },
      { t: 1.06, p: P({ snap: 1, y: 0, rot: -360, tor: 30, a1u: 80, a1l: 60, a2u: 70, a2l: 50, l1u: 60, l1l: -55, l2u: 35, l2l: -70 }), e: 'out' },
      { t: 1.3, p: { ...R2, rot: -360 } },
    ]),
  },
  run(0.7),
];

const TOTAL = SEGS.reduce((a, s) => a + s.d, 0);
const STARTS: number[] = [];
SEGS.reduce((a, s) => (STARTS.push(a), a + s.d), 0);

// integrate scroll speed -> world distance table
const STEP = 1 / 120;
const CUM: number[] = [0];
const speedAt = (t: number) => {
  let i = 0;
  while (i < SEGS.length - 1 && t >= STARTS[i + 1]) i++;
  const s = SEGS[i], lt = clamp(t - STARTS[i], 0, s.d);
  const sp = s.sp;
  for (let k = 0; k < sp.length - 1; k++) {
    if (lt <= sp[k + 1][0]) return lerp(sp[k][1], sp[k + 1][1], (lt - sp[k][0]) / (sp[k + 1][0] - sp[k][0] || 1));
  }
  return sp[sp.length - 1][1];
};
for (let i = 1; i <= Math.ceil(TOTAL / STEP); i++) CUM.push(CUM[i - 1] + speedAt((i - 0.5) * STEP) * STEP);
const LOOP = CUM[CUM.length - 1];
const cumX = (t: number) => {
  const f = clamp(t / STEP, 0, CUM.length - 1.001);
  const i = Math.floor(f);
  return lerp(CUM[i], CUM[i + 1], f - i);
};
const segStart = (n: string) => STARTS[SEGS.findIndex((s) => s.name === n)];

// obstacles, anchored by (time mark, screen offset from runner)
const OB = {
  box: cumX(segStart('SPEED VAULT') + 0.28) + 55,
  wall: cumX(segStart('WALL CLIMB') + 0.52) + 36,
  gap: cumX(segStart('GAP FRONT FLIP') + 0.625),
  beam: cumX(segStart('POWER SLIDE') + 0.5),
};
const BOX_W = 70, BOX_H = 55, WALL_W = 42, WALL_H = 140, GAP_W = 230, BEAM_W = 330, BEAM_Y = 84;

function skyline(w: number, h: number, minH: number, maxH: number, col: string, seed: number, windows: boolean, neon = false) {
  return offscreen(w, h, (c) => {
    const r = rng(seed);
    let x = 0;
    while (x < w) {
      let bw = 50 + r() * 70;
      if (w - x - bw < 60) bw = w - x;
      const bh = minH + r() * (maxH - minH);
      c.fillStyle = col;
      c.fillRect(x, h - bh, bw, bh);
      if (r() > 0.55) { c.fillRect(x + bw * 0.45, h - bh - 24, 3, 24); }
      if (windows) {
        for (let wy = h - bh + 12; wy < h - 10; wy += 15) {
          for (let wx = x + 7; wx < x + bw - 9; wx += 11) {
            if (r() > 0.62) {
              c.fillStyle = r() > 0.55 ? 'rgba(255,200,120,0.85)' : r() > 0.5 ? 'rgba(80,230,255,0.75)' : 'rgba(255,90,170,0.7)';
              c.fillRect(wx, wy, 5, 7);
            }
          }
        }
      }
      if (neon && r() > 0.6) {
        const nc = r() > 0.5 ? '#ff3d81' : '#2ef2ff';
        c.shadowColor = nc; c.shadowBlur = 14; c.fillStyle = nc;
        c.fillRect(x + bw - 8, h - bh + 20, 3, 46);
        c.shadowBlur = 0;
      }
      x += bw + 2;
    }
  });
}

let ASSETS: { sky: HTMLCanvasElement; far: HTMLCanvasElement; mid: HTMLCanvasElement; near: HTMLCanvasElement } | null = null;
function assets() {
  if (ASSETS) return ASSETS;
  const sky = offscreen(W, H, (c) => {
    const g = c.createLinearGradient(0, 0, 0, GY + 20);
    g.addColorStop(0, '#07031a'); g.addColorStop(0.45, '#2a0b4d'); g.addColorStop(0.75, '#b0306f'); g.addColorStop(1, '#ff9a5a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const r = rng(3);
    for (let i = 0; i < 90; i++) {
      c.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.7})`;
      c.fillRect(r() * W, r() * 230, 1.5, 1.5);
    }
    // striped retro sun
    const sun = offscreen(260, 260, (s) => {
      const sg = s.createLinearGradient(0, 0, 0, 260);
      sg.addColorStop(0, '#fff27a'); sg.addColorStop(0.55, '#ff9a4d'); sg.addColorStop(1, '#ff3d81');
      s.fillStyle = sg; s.beginPath(); s.arc(130, 130, 128, 0, Math.PI * 2); s.fill();
      s.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 9; i++) s.fillRect(0, 120 + i * 16, 260, 2 + i * 1.3);
    });
    c.shadowColor = '#ff6a9a'; c.shadowBlur = 60;
    c.drawImage(sun, 690, 190);
    c.shadowBlur = 0;
  });
  ASSETS = {
    sky,
    far: skyline(1300, H, 110, 250, '#3a1259', 11, false),
    mid: skyline(1300, H, 90, 220, '#1d0a38', 21, true),
    near: skyline(1300, H, 60, 150, '#0e0620', 31, true, true),
  };
  return ASSETS;
}

export class ParkourScene implements Scene {
  label = 'SPRINT';
  sub = '';
  progress = 0;
  t = 0;
  cycle = 0;
  phase = 0;
  fx = new FX();
  ghosts = new Ghosts();
  ribbon = new Ribbon();
  lastSeg = -1;
  lastT = 0;
  skel: Skel | null = null;
  dustT = 0;
  cam = 0;
  speed = 0;
  streaks: { x: number; y: number; l: number; v: number }[] = [];
  rnd = rng(5);

  constructor() { assets(); this.reset(); }

  reset() {
    this.t = 0; this.cycle = 0; this.phase = 0; this.lastSeg = -1; this.lastT = 0;
    this.fx.reset(); this.ghosts.clear(); this.ribbon = new Ribbon();
    this.streaks = Array.from({ length: 14 }, () => ({ x: this.rnd() * W, y: 60 + this.rnd() * 360, l: 60 + this.rnd() * 140, v: 0.6 + this.rnd() }));
    this.cam = 0; this.skel = null;
  }

  segIdx(t: number) {
    let i = 0;
    while (i < SEGS.length - 1 && t >= STARTS[i + 1]) i++;
    return i;
  }

  pose(t: number): Pose {
    const i = this.segIdx(t);
    const s = SEGS[i], lt = t - STARTS[i];
    const base = s.kind === 'run' ? runPose(this.phase) : sample(s.tr!, lt).p;
    const BL = 0.12;
    if (lt < BL) {
      const pi = (i - 1 + SEGS.length) % SEGS.length;
      const ps = SEGS[pi];
      let prev = ps.kind === 'run' ? runPose(this.phase) : sample(ps.tr!, ps.d).p;
      prev = { ...prev, rot: ((((prev.rot + 180) % 360) + 360) % 360) - 180 };
      return lerpPose(prev, base, smooth(lt / BL));
    }
    return base;
  }

  update(dt: number) {
    const prevT = this.t;
    this.t += dt;
    if (this.t >= TOTAL) { this.t -= TOTAL; this.cycle++; this.lastSeg = -1; }
    const t = this.t;
    const i = this.segIdx(t);
    const s = SEGS[i], lt = t - STARTS[i];
    this.speed = speedAt(t);
    this.cam = this.cycle * LOOP + cumX(t);
    this.phase += dt * this.speed * 0.0292;
    this.progress = t / TOTAL;
    this.label = s.name;
    this.sub = s.kind === 'run' ? 'Building momentum…' : 'Parkour move';

    if (i !== this.lastSeg) {
      this.lastSeg = i;
      if (s.kind !== 'run') {
        const cols = [s.color ?? '#fff'];
        this.fx.text(CX + 170, 150, s.name + '!', cols[0], 44);
        this.fx.ring(CX, GY - 60, cols[0], 140, 0.5, 4);
      }
    }
    // events
    if (s.ev) {
      const wrapped = prevT > t;
      for (const e of s.ev) {
        const abs = STARTS[i] + e.t;
        if ((!wrapped && prevT < abs && t >= abs) || (wrapped && t >= abs)) this.fireEvent(e, s);
      }
    }
    // pose + skeleton
    const p = this.pose(t);
    const sk = solve(p, CX, GY, 1);
    this.skel = sk;
    this.ribbon.update(dt, sk.head, 1);
    // world-space shift for particles
    const shift = this.speed * dt;
    for (const d of this.fx.dusts) d.x -= shift;
    for (const q of this.fx.sparks) q.x -= shift;
    for (const r of this.fx.rings) r.x -= shift * 0.2;
    for (const sl of this.fx.slashes) { sl.a[0] -= shift; sl.b[0] -= shift; }
    // ground effects
    const lowest = Math.max(sk.f1[1], sk.f2[1], sk.k1[1], sk.hip[1], sk.h1[1]);
    const onGround = lowest > GY - 8;
    this.dustT += dt;
    if (s.kind === 'run' && this.dustT > 0.11) {
      this.dustT = 0;
      this.fx.dust(CX - 14, GY, 2, 'rgba(255,190,220,0.45)', 40);
    }
    if (s.kind === 'slide' && lt > 0.2 && lt < 0.8 && this.dustT > 0.02) {
      this.dustT = 0;
      this.fx.spark(CX + 60, GY - 2, 3, '#ffb347', 380, -Math.PI * 0.8, 1.2, 700);
      this.fx.dust(CX + 30, GY, 1, 'rgba(255,200,150,0.5)', 70);
    }
    if (s.kind === 'roll' && onGround && this.dustT > 0.05) {
      this.dustT = 0;
      this.fx.dust(CX, GY, 2, 'rgba(255,190,220,0.5)', 60);
    }
    const air = s.kind === 'flip' || s.kind === 'back' || s.kind === 'roll' || s.kind === 'slide' || (s.kind === 'vault' && lt > 0.2 && lt < 0.8) || (s.kind === 'wall' && (lt < 0.55 || lt > 1.3));
    this.ghosts.update(dt, sk, air);
    this.fx.update(dt);
    for (const st of this.streaks) {
      st.x -= this.speed * st.v * dt * 1.8;
      if (st.x + st.l < 0) { st.x = W + this.rnd() * 300; st.y = 60 + this.rnd() * 360; }
    }
  }

  fireEvent(e: Ev, s: Seg) {
    const col = s.color ?? '#fff';
    if (e.k === 'land') {
      this.fx.dust(CX, GY, 14, 'rgba(255,200,230,0.55)', 120);
      this.fx.spark(CX, GY - 2, 8, col, 380, -Math.PI / 2, Math.PI * 0.9, 900);
      this.fx.ring(CX, GY, col, 90, 0.4, 4);
      this.fx.shake = Math.max(this.fx.shake, 5);
      this.fx.zoom = Math.max(this.fx.zoom, 0.02);
    } else if (e.k === 'jump') {
      this.fx.dust(CX, GY, 8, 'rgba(255,200,230,0.5)', 90);
      this.fx.ring(CX, GY, col, 70, 0.35, 3);
      this.fx.spark(CX, GY - 2, 6, '#fff', 260, -Math.PI / 2, 1.4, 900);
    } else if (e.k === 'impact') {
      const wx = CX + 38;
      this.fx.spark(wx, GY - 60, 16, col, 500, Math.PI, 1.6, 700);
      this.fx.ring(wx, GY - 60, col, 100, 0.45, 4);
      this.fx.shake = Math.max(this.fx.shake, 7);
      this.fx.flash = 0.12; this.fx.flashColor = col;
    }
  }

  // --- drawing -----------------------------------------------------------
  private layer(ctx: CanvasRenderingContext2D, img: HTMLCanvasElement, f: number, yOff = 0, alpha = 1) {
    const tw = img.width;
    const x = -((this.cam * f) % tw);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, yOff);
    ctx.drawImage(img, x + tw, yOff);
    ctx.globalAlpha = 1;
  }

  private screenX(world: number, k: number) {
    return CX + world + k * LOOP - this.cam;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const a = assets();
    const [sx, sy] = this.fx.shakeOffset();
    ctx.save();
    // camera punch zoom around runner
    const z = 1 + this.fx.zoom + (this.skel && this.progress >= 0 ? 0 : 0);
    ctx.translate(CX, GY - 120);
    ctx.scale(z, z);
    ctx.translate(-CX + sx, -(GY - 120) + sy);

    ctx.drawImage(a.sky, 0, 0);
    this.layer(ctx, a.far, 0.06, -70, 0.9);
    this.layer(ctx, a.mid, 0.16, -20);
    this.layer(ctx, a.near, 0.38, 70);

    // abyss fog
    const fg = ctx.createLinearGradient(0, GY - 40, 0, H);
    fg.addColorStop(0, 'rgba(255,60,140,0)'); fg.addColorStop(0.35, 'rgba(40,8,70,0.85)'); fg.addColorStop(1, '#07020f');
    ctx.fillStyle = fg; ctx.fillRect(-20, GY - 40, W + 40, H - GY + 80);

    this.drawRoof(ctx);
    this.drawObstacles(ctx);

    // speed streaks
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
    for (const s of this.streaks) {
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.l * (this.speed / 430), s.y); ctx.stroke();
    }
    ctx.restore();

    // character
    if (this.skel) {
      const sk = this.skel;
      const low = Math.max(sk.f1[1], sk.f2[1]);
      const h = GY - low;
      // ground shadow (not over gap)
      ctx.save();
      ctx.globalAlpha = clamp(0.5 - h / 300, 0, 0.5);
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(CX, GY + 3, 40 - h * 0.05, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      this.ghosts.draw(ctx, HERO);
      this.ribbon.draw(ctx, HERO.accent);
      drawFigure(ctx, sk, HERO);
    }
    this.fx.draw(ctx);
    ctx.restore();

    this.fx.drawFlash(ctx);
    vignette(ctx, 0.6);
  }

  private drawRoof(ctx: CanvasRenderingContext2D) {
    // gap intervals in screen space
    const gaps: [number, number][] = [];
    for (let k = -1; k <= 1; k++) {
      const c = this.screenX(OB.gap, k);
      gaps.push([c - GAP_W / 2, c + GAP_W / 2]);
    }
    gaps.sort((p, q) => p[0] - q[0]);
    const pieces: [number, number][] = [];
    let cur = -60;
    for (const g of gaps) {
      if (g[0] > cur) pieces.push([cur, Math.min(g[0], W + 60)]);
      cur = Math.max(cur, g[1]);
    }
    if (cur < W + 60) pieces.push([cur, W + 60]);
    for (const [x0, x1] of pieces) {
      if (x1 <= x0) continue;
      ctx.save();
      ctx.beginPath(); ctx.rect(x0, GY, x1 - x0, H - GY); ctx.clip();
      const g = ctx.createLinearGradient(0, GY, 0, H);
      g.addColorStop(0, '#2a1650'); g.addColorStop(0.15, '#190d33'); g.addColorStop(1, '#09040f');
      ctx.fillStyle = g; ctx.fillRect(x0, GY, x1 - x0, H - GY);
      // seams
      ctx.strokeStyle = 'rgba(160,110,255,0.14)'; ctx.lineWidth = 2;
      const off = -(this.cam % 170);
      for (let x = off - 170; x < W + 170; x += 170) { ctx.beginPath(); ctx.moveTo(x, GY + 14); ctx.lineTo(x - 26, H); ctx.stroke(); }
      // dashed guide line
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.setLineDash([36, 28]); ctx.lineDashOffset = this.cam % 64;
      ctx.beginPath(); ctx.moveTo(x0, GY + 42); ctx.lineTo(x1, GY + 42); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      // neon top edge
      ctx.save();
      ctx.shadowColor = '#2ef2ff'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#2ef2ff'; ctx.fillRect(x0, GY - 1, x1 - x0, 3);
      // gap edge lips
      ctx.shadowColor = '#ff3d81'; ctx.fillStyle = '#ff3d81';
      if (x0 > -50) ctx.fillRect(x0 - 2, GY, 3, 90);
      if (x1 < W + 50) ctx.fillRect(x1 - 1, GY, 3, 90);
      ctx.restore();
    }
  }

  private drawObstacles(ctx: CanvasRenderingContext2D) {
    for (let k = -1; k <= 1; k++) {
      // box
      let x = this.screenX(OB.box, k);
      if (x > -100 && x < W + 100) {
        const bx = x - BOX_W / 2, by = GY - BOX_H;
        ctx.save();
        const g = ctx.createLinearGradient(0, by, 0, GY);
        g.addColorStop(0, '#3b2a73'); g.addColorStop(1, '#1b1038');
        ctx.fillStyle = g; ctx.fillRect(bx, by, BOX_W, BOX_H);
        ctx.shadowColor = '#2ef2ff'; ctx.shadowBlur = 14;
        ctx.strokeStyle = '#2ef2ff'; ctx.lineWidth = 2.5; ctx.strokeRect(bx, by, BOX_W, BOX_H);
        ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(46,242,255,0.35)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + BOX_W, GY); ctx.moveTo(bx + BOX_W, by); ctx.lineTo(bx, GY); ctx.stroke();
        ctx.restore();
      }
      // wall
      x = this.screenX(OB.wall, k);
      if (x > -100 && x < W + 100) {
        ctx.save();
        const g = ctx.createLinearGradient(x, 0, x + WALL_W, 0);
        g.addColorStop(0, '#3a2468'); g.addColorStop(1, '#21123f');
        ctx.fillStyle = g; ctx.fillRect(x, GY - WALL_H, WALL_W, WALL_H);
        // bricks
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1.5;
        for (let y = GY - WALL_H + 20; y < GY; y += 20) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + WALL_W, y); ctx.stroke(); }
        // hazard top
        ctx.fillStyle = '#ffd23d'; ctx.fillRect(x - 3, GY - WALL_H - 5, WALL_W + 6, 7);
        ctx.fillStyle = '#111';
        for (let hx = x - 3; hx < x + WALL_W + 3; hx += 12) {
          ctx.beginPath(); ctx.moveTo(hx, GY - WALL_H - 5); ctx.lineTo(hx + 6, GY - WALL_H - 5); ctx.lineTo(hx + 2, GY - WALL_H + 2); ctx.lineTo(hx - 4, GY - WALL_H + 2); ctx.fill();
        }
        ctx.shadowColor = '#ff3d81'; ctx.shadowBlur = 14; ctx.fillStyle = '#ff3d81';
        ctx.fillRect(x - 1, GY - WALL_H, 3, WALL_H);
        ctx.restore();
      }
      // beam
      x = this.screenX(OB.beam, k);
      if (x > -300 && x < W + 300) {
        ctx.save();
        const bx = x - BEAM_W / 2;
        const by = GY - BEAM_Y;
        ctx.fillStyle = '#241446';
        ctx.fillRect(bx + 8, by, 14, BEAM_Y); ctx.fillRect(bx + BEAM_W - 22, by, 14, BEAM_Y);
        ctx.shadowColor = '#ff9a3d'; ctx.shadowBlur = 16;
        const g = ctx.createLinearGradient(0, by - 14, 0, by);
        g.addColorStop(0, '#5b3b9a'); g.addColorStop(1, '#2b1a55');
        ctx.fillStyle = g; ctx.fillRect(bx, by - 14, BEAM_W, 14);
        ctx.fillStyle = '#ff9a3d'; ctx.fillRect(bx, by - 2, BEAM_W, 3);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffd23d';
        for (let hx = bx + 6; hx < bx + BEAM_W - 10; hx += 26) ctx.fillRect(hx, by - 11, 12, 4);
        ctx.restore();
      }
    }
  }
}
