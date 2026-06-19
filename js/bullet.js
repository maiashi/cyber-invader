// ============================================================
// CYBER INVADER - Bullet System
// ============================================================

import { CANVAS_W, CANVAS_H, BULLET_TYPES } from './const.js';
import { angleTo, rand } from './utils.js';

// Player bullet
export class PlayerBullet {
  constructor(x, y, vx, vy, size, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size || 2;
    this.color = color || '#0ff';
    this.alive = true;
    this.life = 0;
    this.maxLife = 300; // 5 seconds max lifetime
  }

  update() {
    this.life++;
    if (this.life >= this.maxLife) {
      this.alive = false;
      return;
    }
    this.x += this.vx;
    this.y += this.vy;
    if (this.y < -10 || this.y > CANVAS_H + 10 || this.x < -10 || this.x > CANVAS_W + 10) {
      this.alive = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  hitsEnemy(ex, ey, er) {
    const dx = this.x - ex;
    const dy = this.y - ey;
    return Math.sqrt(dx * dx + dy * dy) < er + this.size;
  }
}

// Enemy bullet
export class EnemyBullet {
  constructor(x, y, vx, vy, type = 'NORMAL') {
    const bt = BULLET_TYPES[type] || BULLET_TYPES.NORMAL;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.size = bt.size;
    this.color = bt.color;
    this.speed = bt.speed;
    this.alive = true;
    this.homing = type === 'HOMING';
    this.homingStrength = 0.03;
    this.split = type === 'SPLIT';
    this.splitDone = false;
    this.splitTimer = 60;
    this.angle = Math.atan2(vy, vx);
    this.life = 0;
    this.maxLife = 600; // 10 seconds max lifetime to prevent memory buildup
    this.gravity = type === 'GRAVITY' ? 0.08 : 0;
  }

  update(playerX, playerY) {
    this.life++;

    // Kill bullet after max lifetime
    if (this.life >= this.maxLife) {
      this.alive = false;
      return;
    }

    // Homing behavior
    if (this.homing && playerX !== undefined) {
      const targetAngle = angleTo(this.x, this.y, playerX, playerY);
      let diff = targetAngle - this.angle;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      this.angle += diff * this.homingStrength;
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
    }

    // Gravity behavior
    if (this.gravity > 0) {
      this.vy += this.gravity;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Split bullet behavior
    if (this.split && !this.splitDone && this.splitTimer > 0) {
      this.splitTimer--;
      if (this.splitTimer <= 0) {
        this.splitDone = true;
      }
    }

    // Out of bounds
    if (this.x < -20 || this.x > CANVAS_W + 20 || this.y < -20 || this.y > CANVAS_H + 20) {
      this.alive = false;
    }
  }

  getSplitBullets() {
    if (this.split && this.splitDone && !this._splitEmitted) {
      this._splitEmitted = true;
      const bullets = [];
      for (let i = 0; i < 3; i++) {
        const angle = this.angle + (i - 1) * 0.5;
        bullets.push(new EnemyBullet(
          this.x, this.y,
          Math.cos(angle) * this.speed * 0.8,
          Math.sin(angle) * this.speed * 0.8,
          'NORMAL'
        ));
      }
      return bullets;
    }
    return null;
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 4;
    ctx.fillStyle = this.color;

    if (this.type === 'LASER') {
      // Laser: thin line
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.x - this.vx * 2, this.y - this.vy * 2);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    } else if (this.type === 'HOMING') {
      // Homing: pulsing circle
      const pulse = 1 + 0.3 * Math.sin(this.life * 0.2);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * pulse, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'GRAVITY') {
      // Gravity: larger bullet
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal bullet
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  hitsPlayer(px, py, pr) {
    return Math.abs(this.x - px) < pr + this.size && Math.abs(this.y - py) < pr + this.size;
  }
}

// Bullet pattern generators
export class BulletPatterns {
  // Spread shot from a point
  static spread(cx, cy, count, angle, spread, speed, type = 'NORMAL') {
    const bullets = [];
    const step = spread / Math.max(count - 1, 1);
    for (let i = 0; i < count; i++) {
      const a = angle - spread / 2 + step * i;
      bullets.push(new EnemyBullet(
        cx, cy,
        Math.cos(a) * speed,
        Math.sin(a) * speed,
        type
      ));
    }
    return bullets;
  }

  // Circle shot
  static circle(cx, cy, count, speed, type = 'NORMAL', startAngle = 0) {
    const bullets = [];
    for (let i = 0; i < count; i++) {
      const a = startAngle + (Math.PI * 2 / count) * i;
      bullets.push(new EnemyBullet(
        cx, cy,
        Math.cos(a) * speed,
        Math.sin(a) * speed,
        type
      ));
    }
    return bullets;
  }

  // Spiral shot
  static spiral(cx, cy, count, speed, type = 'NORMAL', phase = 0) {
    const bullets = [];
    for (let i = 0; i < count; i++) {
      const a = phase + (Math.PI * 2 / count) * i;
      bullets.push(new EnemyBullet(
        cx, cy,
        Math.cos(a) * speed,
        Math.sin(a) * speed,
        type
      ));
    }
    return bullets;
  }

  // Aimed shot at player
  static aimed(cx, cy, targetX, targetY, speed, type = 'NORMAL') {
    const a = angleTo(cx, cy, targetX, targetY);
    return [new EnemyBullet(cx, cy, Math.cos(a) * speed, Math.sin(a) * speed, type)];
  }

  // Aimed spread
  static aimedSpread(cx, cy, targetX, targetY, count, spread, speed, type = 'NORMAL') {
    const baseAngle = angleTo(cx, cy, targetX, targetY);
    return this.spread(cx, cy, count, baseAngle, spread, speed, type);
  }

  // Rotating pattern
  static rotating(cx, cy, count, speed, type, time, rotationSpeed = 0.03) {
    return this.circle(cx, cy, count, speed, type, time * rotationSpeed);
  }

  // Double spiral
  static doubleSpiral(cx, cy, count, speed, type, time, rotSpeed = 0.05) {
    const bullets = [];
    for (let i = 0; i < count; i++) {
      const a1 = time * rotSpeed + (Math.PI * 2 / count) * i;
      const a2 = -time * rotSpeed + (Math.PI * 2 / count) * i;
      bullets.push(new EnemyBullet(cx, cy, Math.cos(a1) * speed, Math.sin(a1) * speed, type));
      bullets.push(new EnemyBullet(cx, cy, Math.cos(a2) * speed, Math.sin(a2) * speed, type));
    }
    return bullets;
  }

  // Wave pattern
  static wave(cx, cy, count, speed, type, time, waveSpeed = 0.05) {
    const bullets = [];
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 / count) * i + Math.sin(time * waveSpeed + i) * 0.5;
      bullets.push(new EnemyBullet(cx, cy, Math.cos(a) * speed, Math.sin(a) * speed, type));
    }
    return bullets;
  }

  // Laser beam (instant hit line)
  static laser(x1, y1, x2, y2) {
    // Returns a laser object for rendering, not a bullet
    return { type: 'laser', x1, y1, x2, y2, life: 15 };
  }
}
