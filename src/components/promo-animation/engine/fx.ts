import { Vec } from './rig';

export const W = 1000;
export const H = 562;

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function offscreen(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d')!);
  return cv;
}

interface Spark { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; len: number; g: number }
interface Dust { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; color: string }
interface Ring { x: number; y: number; r: number; max: number; life: number; color: string; w: number }
interface Text { x: number; y: number; s: string; life: number; color: string; size: number; rot: number }
interface Slash { a: Vec; b: Vec; life: number; color: string; w: number }

export class FX {
  sparks: Spark[] = [];
  dusts: Dust[] = [];
  rings: Ring[] = [];
  texts: Text[] = [];
  slashes: Slash[] = [];
  flash = 0;
  flashColor = '#fff';
  shake = 0;
  zoom = 0;
  private rand = rng(7);

  reset() {
    this.sparks = []; this.dusts = []; this.rings = []; this.texts = []; this.slashes = [];
    this.flash = 0; this.shake = 0; this.zoom = 0;
  }

  spark(x: number, y: number, n: number, color: string, speed = 520, dir?: number, spread = Math.PI * 2, g = 900) {
    for (let i = 0; i < n; i++) {
      const a = (dir ?? 0) + (this.rand() - 0.5) * spread;
      const sp = speed * (0.35 + this.rand() * 0.8);
      const life = 0.25 + this.rand() * 0.45;
      this.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, color, len: 0.03 + this.rand() * 0.03, g });
    }
  }

  dust(x: number, y: number, n: number, color = 'rgba(200,190,210,0.5)', spread = 60) {
    for (let i = 0; i < n; i++) {
      const life = 0.4 + this.rand() * 0.5;
      this.dusts.push({
        x: x + (this.rand() - 0.5) * 14, y: y - this.rand() * 4,
        vx: (this.rand() - 0.5) * spread * 2, vy: -this.rand() * 40 - 10,
        life, max: life, r: 4 + this.rand() * 8, color,
      });
    }
  }

  ring(x: number, y: number, color: string, max = 90, life = 0.45, w = 5) {
    this.rings.push({ x, y, r: 6, max, life, color, w });
  }

  text(x: number, y: number, s: string, color = '#fff', size = 34) {
    this.texts.push({ x, y, s, life: 1, color, size, rot: (this.rand() - 0.5) * 0.35 });
  }

  slash(a: Vec, b: Vec, color = '#fff', w = 8) {
    this.slashes.push({ a, b, life: 1, color, w });
  }

  impact(x: number, y: number, color: string, power = 1, dir = 0) {
    this.spark(x, y, Math.round(18 * power), color, 620 * power, dir, Math.PI * 1.2);
    this.spark(x, y, Math.round(10 * power), '#ffffff', 420 * power, dir, Math.PI * 2);
    this.ring(x, y, color, 70 * power + 20, 0.4);
    this.ring(x, y, '#ffffff', 40 * power + 10, 0.25, 3);
    this.shake = Math.max(this.shake, 7 * power);
    this.flash = Math.max(this.flash, 0.18 * power);
    this.flashColor = color;
    this.zoom = Math.max(this.zoom, 0.02 * power);
  }

  update(dt: number) {
    for (const s of this.sparks) {
      s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += s.g * dt; s.vx *= 1 - dt * 1.2;
    }
    this.sparks = this.sparks.filter((s) => s.life > 0);
    for (const d of this.dusts) { d.life -= dt; d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= 1 - dt * 2; d.r += dt * 14; }
    this.dusts = this.dusts.filter((d) => d.life > 0);
    for (const r of this.rings) { r.life -= dt; r.r += (r.max - r.r) * Math.min(1, dt * 9); }
    this.rings = this.rings.filter((r) => r.life > 0);
    for (const t of this.texts) t.life -= dt * 1.3;
    this.texts = this.texts.filter((t) => t.life > 0);
    for (const s of this.slashes) s.life -= dt * 3.2;
    this.slashes = this.slashes.filter((s) => s.life > 0);
    this.flash = Math.max(0, this.flash - dt * 1.8);
    this.shake = Math.max(0, this.shake - dt * 28);
    this.zoom = Math.max(0, this.zoom - dt * 0.12);
  }

  shakeOffset(): Vec {
    return [(Math.random() - 0.5) * this.shake * 2, (Math.random() - 0.5) * this.shake * 2];
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const d of this.dusts) {
      ctx.globalAlpha = (d.life / d.max) * 0.6;
      ctx.fillStyle = d.color;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const r of this.rings) {
      ctx.globalAlpha = Math.max(0, r.life / 0.45);
      ctx.strokeStyle = r.color; ctx.lineWidth = r.w * Math.max(0.2, r.life * 2);
      ctx.shadowColor = r.color; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    for (const s of this.slashes) {
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.shadowColor = s.color; ctx.shadowBlur = 24;
      ctx.strokeStyle = s.color; ctx.lineCap = 'round';
      const k = s.life;
      ctx.lineWidth = s.w * k;
      ctx.beginPath(); ctx.moveTo(s.a[0], s.a[1]); ctx.lineTo(s.b[0], s.b[1]); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = s.w * k * 0.35;
      ctx.beginPath(); ctx.moveTo(s.a[0], s.a[1]); ctx.lineTo(s.b[0], s.b[1]); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.lineCap = 'round';
    for (const s of this.sparks) {
      const k = s.life / s.max;
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.strokeStyle = s.color; ctx.lineWidth = 1 + 2.2 * k;
      ctx.shadowColor = s.color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * s.len, s.y - s.vy * s.len); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    for (const t of this.texts) {
      const k = t.life;
      const pop = k > 0.8 ? 1 + (k - 0.8) * 3 : 1;
      ctx.save();
      ctx.translate(t.x, t.y - (1 - k) * 36);
      ctx.rotate(t.rot);
      ctx.scale(pop, pop);
      ctx.globalAlpha = Math.min(1, k * 2);
      ctx.font = `900 italic ${t.size}px "Impact", "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 7; ctx.strokeStyle = '#05050c'; ctx.lineJoin = 'round';
      ctx.strokeText(t.s, 0, 0);
      ctx.shadowColor = t.color; ctx.shadowBlur = 16;
      ctx.fillStyle = t.color;
      ctx.fillText(t.s, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  drawFlash(ctx: CanvasRenderingContext2D) {
    if (this.flash <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = Math.min(0.85, this.flash);
    ctx.fillStyle = this.flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

export interface Scene {
  label: string;
  sub: string;
  progress: number;
  reset(): void;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

export function vignette(ctx: CanvasRenderingContext2D, strength = 0.55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function letterbox(ctx: CanvasRenderingContext2D, amount: number) {
  if (amount <= 0) return;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, amount);
  ctx.fillRect(0, H - amount, W, amount);
}
