// ============================================================
// CYBER INVADER - Particle System
// ============================================================

import { rand, randInt } from './utils.js';

export class Particle {
  constructor(x, y, vx, vy, color, size, life, type = 'normal') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.type = type;
    this.alive = true;
    this.gravity = type === 'gravity' ? 0.05 : 0;
    this.friction = type === 'spark' ? 0.95 : 0.98;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.alive = false;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    const size = this.size * alpha;

    ctx.save();
    if (this.type === 'spark') {
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
      ctx.stroke();
    } else if (this.type === 'glow') {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha * 0.5;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 500; // Cap to prevent memory/performance issues
  }

  update() {
    for (const p of this.particles) {
      p.update();
    }
    this.particles = this.particles.filter(p => p.alive);
  }

  draw(ctx) {
    for (const p of this.particles) {
      p.draw(ctx);
    }
  }

  // Internal helper to add a particle with cap check
  _add(particle) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push(particle);
    }
  }

  // Explosion effect
  explode(x, y, color, count = 20, size = 3, speed = 4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = rand(1, speed);
      this._add(new Particle(
        x, y,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        color,
        rand(1, size),
        randInt(20, 50),
        'normal'
      ));
    }
    // Add sparks
    for (let i = 0; i < count / 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = rand(2, speed * 1.5);
      this._add(new Particle(
        x, y,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        '#fff',
        rand(0.5, 1.5),
        randInt(10, 25),
        'spark'
      ));
    }
    // Glow core
    this._add(new Particle(
      x, y, 0, 0, color, 5, 30, 'glow'
    ));
    // Ring effect
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      this._add(new Particle(
        x, y,
        Math.cos(angle) * 3,
        Math.sin(angle) * 3,
        '#fff',
        2,
        20,
        'spark'
      ));
    }
  }

  // Big explosion (boss)
  bigExplode(x, y, color, count = 50) {
    this.explode(x, y, color, count, 5, 6);
    // Massive sparks
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = rand(3, 8);
      this._add(new Particle(
        x, y,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        '#fff',
        rand(1, 2),
        randInt(15, 40),
        'spark'
      ));
    }
    // Multiple glow cores
    for (let i = 0; i < 3; i++) {
      this._add(new Particle(
        x + rand(-10, 10), y + rand(-10, 10),
        0, 0, color, rand(8, 15), randInt(20, 40), 'glow'
      ));
    }
    // Shockwave ring
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      this._add(new Particle(
        x, y,
        Math.cos(angle) * 4,
        Math.sin(angle) * 4,
        '#fff',
        3,
        30,
        'spark'
      ));
    }
    // Secondary explosions
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const ox = x + rand(-30, 30);
        const oy = y + rand(-30, 30);
        this.explode(ox, oy, color, 15, 3, 4);
      }, i * 100);
    }
  }

  // Power-up pickup effect
  powerUpEffect(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      this._add(new Particle(
        x, y,
        Math.cos(angle) * 2,
        Math.sin(angle) * 2,
        '#0f0',
        2,
        30,
        'spark'
      ));
    }
  }

  // Bomb effect
  bombEffect(x, y) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = rand(3, 8);
      this._add(new Particle(
        x, y,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        '#ff0',
        rand(2, 5),
        randInt(30, 60),
        'normal'
      ));
    }
    this._add(new Particle(x, y, 0, 0, '#ff0', 20, 40, 'glow'));
  }

  // Engine trail
  engineTrail(x, y, color) {
    this._add(new Particle(
      x + rand(-3, 3), y,
      rand(-0.5, 0.5),
      rand(1, 3),
      color,
      rand(1, 2),
      randInt(10, 20),
      'normal'
    ));
  }

  // Ring effect (expanding circle of particles)
  ringEffect(x, y, color, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      this._add(new Particle(
        x, y,
        Math.cos(angle) * 4,
        Math.sin(angle) * 4,
        color,
        3,
        randInt(25, 40),
        'spark'
      ));
    }
  }
}
