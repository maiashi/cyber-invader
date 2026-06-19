// ============================================================
// CYBER INVADER - Player
// ============================================================

import { PLAYER, POWER_LEVELS, CANVAS_W, CANVAS_H } from './const.js';
import { clamp } from './utils.js';

export class Player {
  constructor() {
    this.x = CANVAS_W / 2;
    this.y = CANVAS_H - 60;
    this.w = PLAYER.W;
    this.h = PLAYER.H;
    this.hitboxR = PLAYER.HITBOX_R;
    this.speed = PLAYER.SPEED;
    this.focusSpeed = PLAYER.FOCUS_SPEED;
    this.powerLevel = 0; // 0-4
    this.lives = PLAYER.MAX_LIVES;
    this.bombs = PLAYER.MAX_BOMBS;
    this.bombType = 'CLEAR'; // 'CLEAR' or 'ABSORB'
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.isFocus = false;
    this.shotCooldown = 0;
    this.absorbTimer = 0;
    this.flashTimer = 0; // Visual flash on power-up
    this.trail = []; // Trail positions for visual effect
    this.autoShoot = true; // Auto-shoot enabled
  }

  reset() {
    this.x = CANVAS_W / 2;
    this.y = CANVAS_H - 60;
    this.powerLevel = 0;
    this.lives = PLAYER.MAX_LIVES;
    this.bombs = PLAYER.MAX_BOMBS;
    this.bombType = 'CLEAR';
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.isFocus = false;
    this.shotCooldown = 0;
    this.absorbTimer = 0;
    this.flashTimer = 0;
    this.trail = [];
  }

  update(keys) {
    // Movement
    let speed = this.isFocus ? this.focusSpeed : this.speed;

    if (keys['ArrowLeft'] || keys['a']) this.x -= speed;
    if (keys['ArrowRight'] || keys['d']) this.x += speed;
    if (keys['ArrowUp'] || keys['w']) this.y -= speed;
    if (keys['ArrowDown'] || keys['s']) this.y += speed;

    // Focus mode
    this.isFocus = keys['x'] || keys['X'];
    if (this.isFocus) speed = this.focusSpeed;

    // Clamp to screen
    this.x = clamp(this.x, this.w / 2, CANVAS_W - this.w / 2);
    this.y = clamp(this.y, this.h / 2, CANVAS_H - this.h / 2);

    // Shot cooldown
    if (this.shotCooldown > 0) this.shotCooldown--;

    // Invincibility timer
    if (this.isInvincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) this.isInvincible = false;
    }

    // Absorb timer
    if (this.absorbTimer > 0) this.absorbTimer--;

    // Flash timer
    if (this.flashTimer > 0) this.flashTimer--;

    // Trail
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.pop();
  }

  canShoot() {
    return this.shotCooldown <= 0;
  }

  shoot() {
    if (!this.canShoot()) return [];
    this.shotCooldown = PLAYER.SHOT_COOLDOWN;
    const level = POWER_LEVELS[this.powerLevel];
    const bullets = [];
    const angles = [];

    // Calculate spread angles (upward = -PI/2)
    if (level.bulletCount === 1) {
      angles.push(-Math.PI / 2);
    } else {
      for (let i = 0; i < level.bulletCount; i++) {
        const t = (i / (level.bulletCount - 1)) - 0.5;
        angles.push(-Math.PI / 2 + t * level.spread);
      }
    }

    for (const angle of angles) {
      bullets.push({
        x: this.x,
        y: this.y - this.h / 2,
        vx: Math.cos(angle) * level.speed,
        vy: Math.sin(angle) * level.speed,
        size: 2 + this.powerLevel * 0.3,
        color: level.color,
        glow: true,
        damage: 1,
      });
    }

    return bullets;
  }

  hit() {
    if (this.isInvincible) return false;
    if (this.absorbTimer > 0) {
      this.absorbTimer = 0;
      return false; // Absorbed
    }
    this.lives--;
    this.isInvincible = true;
    this.invincibleTimer = PLAYER.INVINCIBLE_FRAMES;
    // Downgrade power level
    if (this.powerLevel > 0) this.powerLevel--;
    return this.lives <= 0;
  }

  powerUp() {
    if (this.powerLevel < POWER_LEVELS.length - 1) {
      this.powerLevel++;
      this.flashTimer = 30;
    }
  }

  addBomb() {
    if (this.bombs < PLAYER.MAX_BOMBS) {
      this.bombs++;
    }
  }

  getHitbox() {
    return { x: this.x, y: this.y, r: this.hitboxR };
  }

  draw(ctx) {
    // Trail effect
    for (let i = 1; i < this.trail.length; i++) {
      const alpha = (1 - i / this.trail.length) * 0.3;
      const t = this.trail[i];
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Invincibility flash
    if (this.isInvincible && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      return; // Blink
    }

    // Absorb shield glow
    if (this.absorbTimer > 0) {
      ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 + 0.5 * Math.sin(Date.now() / 100)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Ship body - main shape
    ctx.save();
    ctx.translate(this.x, this.y);

    // Glow
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = this.isFocus ? 15 : 8;

    // Ship body
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.moveTo(0, -this.h / 2);           // Nose
    ctx.lineTo(-this.w / 2, this.h / 2);  // Left wing
    ctx.lineTo(-this.w / 4, this.h / 3);  // Left inner
    ctx.lineTo(0, this.h / 4);            // Bottom center
    ctx.lineTo(this.w / 4, this.h / 3);   // Right inner
    ctx.lineTo(this.w / 2, this.h / 2);   // Right wing
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Focus mode indicator
    if (this.isFocus) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // Hitbox debug (uncomment for testing)
    // ctx.strokeStyle = 'red';
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.hitboxR, 0, Math.PI * 2);
    // ctx.stroke();
  }
}
