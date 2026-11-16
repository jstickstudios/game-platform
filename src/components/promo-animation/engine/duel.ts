import { FX, H, Scene, W, vignette } from './fx';
import {
  Ghosts, KF, Pose, Ribbon, Skel, Style, SwordTrail, aimSword, bump, drawFigure, sample, smooth, solve,
} from './rig';


export interface DEvent {
  t: number;
  k: string;
  by?: 'A' | 'B';
  limb?: 'h1' | 'h2' | 'f1' | 'f2';
  power?: number;
  text?: string;
}

export class Fighter {
  x = 0;
  face: number;
  pose!: Pose;
  skel!: Skel;
  ribbon = new Ribbon();
  ghosts = new Ghosts();
  trail = new SwordTrail();
  vx = 0;
  private lastX: number | null = null;
  constructor(public tr: Required<KF>[], public style: Style, public sword: boolean, public face0: number) {
    this.face = face0;
  }
  reset() {
    this.face = this.face0; this.lastX = null;
    this.ribbon = new Ribbon(); this.ghosts.clear(); this.trail.clear();
  }
  update(dt: number, T: number, ground: number, other: Fighter | null, lock: boolean) {
    const s = sample(this.tr, T);
    this.pose = s.p; this.x = s.x;
    const r = ((s.p.rot % 360) + 360) % 360;
    const upright = r < 3 || r > 357;
    if (!lock && upright && other) {
      const d = other.x - this.x;
      if (Math.abs(d) > 14) this.face = d > 0 ? 1 : -1;
    }
    this.skel = solve(s.p, this.x, ground, this.face);
    this.vx = this.lastX === null ? 0 : (this.x - this.lastX) / Math.max(dt, 1e-4);
    this.lastX = this.x;
  }
  post(dt: number) {
    this.ribbon.update(dt, this.skel.head, this.face);
    const fast = Math.abs(this.vx) > 380 || !(((this.pose.rot % 360) + 360) % 360 < 3 || ((this.pose.rot % 360) + 360) % 360 > 357) || this.pose.snap < 0.4;
    this.ghosts.update(dt, this.skel, fast);
    if (this.sword) this.trail.update(this.skel);
  }
  tip(l: 'h1' | 'h2' | 'f1' | 'f2'): [number, number] {
    const s = this.skel;
    return s[l] as [number, number];
  }
}

export interface DuelCfg {
  len: number;
  ground: number;
  hero: { tr: Required<KF>[]; style: Style; sword: boolean; face: number };
  foe: { tr: Required<KF>[]; style: Style; sword: boolean; face: number };
  events: DEvent[];
  slow: { t: number; w: number; s: number }[];
  lock: [number, number][];
  label: (T: number) => string;
  bg: (ctx: CanvasRenderingContext2D, s: DuelScene) => void;
  front?: (ctx: CanvasRenderingContext2D, s: DuelScene) => void;
  hud?: (ctx: CanvasRenderingContext2D, s: DuelScene) => void;
  onEvent: (e: DEvent, s: DuelScene) => void;
  onUpdate?: (dt: number, s: DuelScene) => void;
  onReset?: (s: DuelScene) => void;
  cam?: (T: number) => number;
}

export class DuelScene implements Scene {
  label = '';
  sub = '';
  progress = 0;
  T = 0;
  real = 0;
  fx = new FX();
  hero: Fighter;
  foe: Fighter;
  fired = new Set<number>();
  clash: [number, number] = [0, 0];
  timeScale = 1;
  extra: Record<string, number> = {};

  constructor(public cfg: DuelCfg) {
    this.hero = new Fighter(cfg.hero.tr, cfg.hero.style, cfg.hero.sword, cfg.hero.face);
    this.foe = new Fighter(cfg.foe.tr, cfg.foe.style, cfg.foe.sword, cfg.foe.face);
    this.reset();
  }

  reset() {
    this.T = 0; this.real = 0;
    this.fired.clear();
    this.fx.reset();
    this.hero.reset(); this.foe.reset();
    this.extra = {};
    this.cfg.onReset?.(this);
    this.step(0.0001);
  }

  scale() {
    let s = 1;
    for (const w of this.cfg.slow) s = Math.min(s, 1 - (1 - w.s) * smooth(bump(this.T - w.t, w.w)));
    return s;
  }

  update(realDt: number) {
    this.timeScale = this.scale();
    const dt = realDt * this.timeScale;
    this.real += realDt;
    this.step(dt);
    this.cfg.onUpdate?.(dt, this);
  }

  private step(dt: number) {
    const c = this.cfg;
    this.T += dt;
    if (this.T >= c.len) {
      this.T = 0.0001; this.fired.clear(); this.fx.reset();
      this.hero.reset(); this.foe.reset();
      this.cfg.onReset?.(this);
    }
    const T = this.T;
    const lock = c.lock.some(([a, b]) => T >= a && T <= b);
    this.hero.update(dt, T, c.ground, this.foe, lock);
    this.foe.update(dt, T, c.ground, this.hero, lock);

    // sword clash aiming: blades cross above the midpoint of the two hands
    for (const e of c.events) {
      if (e.k !== 'clash') continue;
      const w = smooth(bump(T - e.t, 0.14));
      if (w > 0) {
        const a = this.hero.skel, b = this.foe.skel;
        const tgt: [number, number] = [(a.h1[0] + b.h1[0]) / 2, Math.min(a.h1[1], b.h1[1]) - 26];
        aimSword(a, tgt, w); aimSword(b, tgt, w);
        this.clash = tgt;
      }
    }
    this.hero.post(dt); this.foe.post(dt);
    if (!this.hero.sword) { this.hero.trail.clear(); }

    c.events.forEach((e, i) => {
      if (!this.fired.has(i) && T >= e.t) {
        this.fired.add(i);
        if (T - e.t < 0.25) c.onEvent(e, this);
      }
    });
    this.fx.update(dt);
    this.progress = T / c.len;
    this.label = c.label(T);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const c = this.cfg;
    const [sx, sy] = this.fx.shakeOffset();
    ctx.save();
    const z = 1 + this.fx.zoom + (c.cam?.(this.T) ?? 0);
    const fx = Math.max(300, Math.min(700, (this.hero.x + this.foe.x) / 2)), fy = c.ground - 90;
    ctx.translate(fx, fy);
    ctx.scale(z, z);
    ctx.translate(-fx + sx, -fy + sy);
    c.bg(ctx, this);
    // shadows
    for (const f of [this.hero, this.foe]) {
      const sk = f.skel;
      const low = Math.max(sk.f1[1], sk.f2[1], sk.hip[1], sk.head[1]);
      const h = Math.max(0, c.ground - low);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 0.5 - h / 300);
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(sk.hip[0], c.ground + 4, 46, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    for (const f of [this.foe, this.hero]) {
      f.ghosts.draw(ctx, f.style, f.sword);
      if (f.sword) f.trail.draw(ctx, f.style.blade ?? f.style.glow);
      f.ribbon.draw(ctx, f.style.accent);
      drawFigure(ctx, f.skel, f.style, { sword: f.sword });
    }
    this.fx.draw(ctx);
    c.front?.(ctx, this);
    ctx.restore();
    this.fx.drawFlash(ctx);
    vignette(ctx, 0.65);
    c.hud?.(ctx, this);
    // fade in / out between loops
    const f = Math.min(1, this.T / 0.45, (c.len - this.T) / 0.7);
    if (f < 1) {
      ctx.fillStyle = `rgba(0,0,0,${1 - Math.max(0, f)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}
