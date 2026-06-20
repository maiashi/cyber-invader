// ============================================================
// CYBER INVADER - Enemy System
// ============================================================

import { ENEMY_TYPES, CANVAS_W, CANVAS_H } from './const.js';
import { rand, randInt, clamp, angleTo } from './utils.js';
import { BulletPatterns } from './bullet.js';

export class Enemy {
  constructor(type, x, y, config = {}) {
    const et = ENEMY_TYPES[type] || ENEMY_TYPES.GRUNT;
    this.type = type;
    this.x = x;
    this.y = y;
    this.hp = config.hp || et.hp;
    this.maxHp = this.hp;
    this.score = et.score;
    this.size = et.size;
    this.color = et.color;
    this.fireRate = config.fireRate || et.fireRate;
    this.fireTimer = randInt(0, this.fireRate);
    this.alive = true;
    this.flashTimer = 0;
    this.phase = 0;
    this.phaseTimer = 0;
    this.movePattern = config.movePattern || 'static';
    this.moveTimer = 0;
    this.moveSpeed = config.moveSpeed || 1;
    this.originX = x;
    this.originY = y;
    this.bulletPattern = config.bulletPattern || 'aimed';
    this.entering = true;
    this.enterTargetY = y;
    this.enterY = -30;
    this.shielded = config.shielded || false;
    this.shieldAngle = 0;
    this.shieldMaxAbsorb = config.shieldMaxAbsorb || 100;
    this.shieldAbsorbCount = this.shieldMaxAbsorb;
    this.buffTimer = 0;
    // Delay before firing after entering (frames)
    this.fireDelay = config.fireDelay || 80;
  }

  update(playerX, playerY, frame) {
    // Enter animation
    if (this.entering) {
      this.y += 2;
      if (this.y >= this.enterTargetY) {
        this.y = this.enterTargetY;
        this.entering = false;
      }
      return null;
    }

    // Movement patterns
    this.moveTimer++;
    switch (this.movePattern) {
      case 'static':
        break;
      case 'sine':
        this.x = this.originX + Math.sin(this.moveTimer * 0.02 * this.moveSpeed) * 40;
        break;
      case 'sineV':
        this.x = this.originX + Math.sin(this.moveTimer * 0.02 * this.moveSpeed) * 40;
        this.y = this.originY + Math.sin(this.moveTimer * 0.01 * this.moveSpeed) * 20;
        break;
      case 'circle':
        this.x = this.originX + Math.cos(this.moveTimer * 0.015 * this.moveSpeed) * 30;
        this.y = this.originY + Math.sin(this.moveTimer * 0.015 * this.moveSpeed) * 20;
        break;
      case 'invader':
        // Invader-style march
        this.x = this.originX + Math.sin(this.moveTimer * 0.01) * 60;
        if (Math.abs(this.x - this.originX) > 55) {
          this.originY += 5;
          this.y = this.originY;
        }
        break;
      case 'boss':
        this.x = CANVAS_W / 2 + Math.sin(this.moveTimer * 0.01) * (CANVAS_W / 2 - 80);
        this.y = this.originY + Math.sin(this.moveTimer * 0.005) * 30;
        break;
    }

    // Flash timer
    if (this.flashTimer > 0) this.flashTimer--;

    // Phase timer
    this.phaseTimer++;

    // Shield rotation
    if (this.shielded) {
      this.shieldAngle += 0.05;
    }

    // Fire
    this.fireTimer--;
    if (this.fireTimer <= 0 && this.fireDelay <= 0) {
      this.fireTimer = this.fireRate;
      return this.fire(playerX, playerY, frame);
    }

    // Count down fire delay
    if (this.fireDelay > 0) this.fireDelay--;

    return null;
  }

  fire(px, py, frame) {
    const bullets = [];
    const pattern = this.bulletPattern;

    switch (pattern) {
      case 'aimed':
        bullets.push(...BulletPatterns.aimed(this.x, this.y, px, py, 3, 'NORMAL'));
        break;
      case 'aimedSpread':
        bullets.push(...BulletPatterns.aimedSpread(this.x, this.y, px, py, 3, 0.3, 3, 'NORMAL'));
        break;
      case 'spread':
        bullets.push(...BulletPatterns.spread(this.x, this.y, 5, Math.PI / 2, 0.8, 2.5, 'NORMAL'));
        break;
      case 'circle':
        bullets.push(...BulletPatterns.circle(this.x, this.y, 8, 2, 'NORMAL'));
        break;
      case 'spiral':
        bullets.push(...BulletPatterns.spiral(this.x, this.y, 6, 2.5, 'NORMAL', frame * 0.05));
        break;
      case 'homing':
        bullets.push(...BulletPatterns.aimed(this.x, this.y, px, py, 2, 'HOMING'));
        break;
      case 'laser':
        bullets.push(...BulletPatterns.aimed(this.x, this.y, px, py, 8, 'LASER'));
        break;
      case 'split':
        bullets.push(...BulletPatterns.aimed(this.x, this.y, px, py, 2.5, 'SPLIT'));
        break;
      case 'doubleSpiral':
        bullets.push(...BulletPatterns.doubleSpiral(this.x, this.y, 5, 2, 'NORMAL', frame, 0.04));
        break;
      case 'wave':
        bullets.push(...BulletPatterns.wave(this.x, this.y, 8, 2.5, 'NORMAL', frame, 0.03));
        break;
      case 'rotating':
        bullets.push(...BulletPatterns.rotating(this.x, this.y, 10, 2, 'NORMAL', frame, 0.02));
        break;
      case 'gravity':
        bullets.push(...BulletPatterns.spread(this.x, this.y, 4, Math.PI / 2, 0.5, 1.5, 'GRAVITY'));
        break;
      case 'mixed':
        if (frame % 3 === 0) {
          bullets.push(...BulletPatterns.aimed(this.x, this.y, px, py, 3, 'NORMAL'));
        } else if (frame % 3 === 1) {
          bullets.push(...BulletPatterns.circle(this.x, this.y, 6, 2, 'NORMAL'));
        } else {
          bullets.push(...BulletPatterns.aimed(this.x, this.y, px, py, 2, 'HOMING'));
        }
        break;
      default:
        bullets.push(...BulletPatterns.aimed(this.x, this.y, px, py, 3, 'NORMAL'));
    }

    return bullets;
  }

  hit(damage = 1) {
    this.hp -= damage;
    this.flashTimer = 5;
    if (this.hp <= 0) {
      this.alive = false;
    }
    return !this.alive;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const glowColor = this.flashTimer > 0 ? '#fff' : this.color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 6;

    // Ship body based on type
    switch (this.type) {
      case 'GRUNT':
        this.drawGrunt(ctx, glowColor);
        break;
      case 'MEDIUM':
        this.drawMedium(ctx, glowColor);
        break;
      case 'TURRET':
        this.drawTurret(ctx, glowColor);
        break;
      case 'SUPPORT':
        this.drawSupport(ctx, glowColor);
        break;
      case 'BOSS':
        this.drawBoss(ctx, glowColor);
        break;
      default:
        this.drawGrunt(ctx, glowColor);
    }

    // Shield
    if (this.shielded) {
      const shieldRatio = this.shieldAbsorbCount / this.shieldMaxAbsorb;
      const shieldAlpha = 0.3 + shieldRatio * 0.4;
      const shieldColor = shieldRatio > 0.5 ? 'rgba(0, 255, 255, ' : 'rgba(255, 100, 100, ';
      ctx.strokeStyle = shieldColor + shieldAlpha + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.size + 8, this.shieldAngle, this.shieldAngle + Math.PI * 1.2);
      ctx.stroke();
      // Shield durability indicator
      if (this.type === 'BOSS') {
        ctx.fillStyle = shieldColor + '0.6)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SHIELD ' + Math.ceil(shieldRatio * 100) + '%', 0, this.size + 20);
      }
    }

    // HP bar for medium+ enemies
    if (this.maxHp > 1 && this.hp < this.maxHp) {
      const barW = this.size * 1.5;
      const barH = 3;
      const barY = -this.size - 8;
      ctx.fillStyle = '#333';
      ctx.fillRect(-barW / 2, barY, barW, barH);
      ctx.fillStyle = this.color;
      ctx.fillRect(-barW / 2, barY, barW * (this.hp / this.maxHp), barH);
    }

    ctx.restore();
  }

  drawGrunt(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -this.size / 2);
    ctx.lineTo(-this.size / 2, this.size / 4);
    ctx.lineTo(-this.size / 3, this.size / 2);
    ctx.lineTo(this.size / 3, this.size / 2);
    ctx.lineTo(this.size / 2, this.size / 4);
    ctx.closePath();
    ctx.fill();
  }

  drawMedium(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -this.size / 2);
    ctx.lineTo(-this.size / 2, 0);
    ctx.lineTo(-this.size / 3, this.size / 2);
    ctx.lineTo(0, this.size / 3);
    ctx.lineTo(this.size / 3, this.size / 2);
    ctx.lineTo(this.size / 2, 0);
    ctx.closePath();
    ctx.fill();
    // Inner detail
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, -2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTurret(ctx, color) {
    ctx.fillStyle = color;
    // Hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const px = Math.cos(a) * this.size / 2;
      const py = Math.sin(a) * this.size / 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    // Cannon
    ctx.fillStyle = '#fff';
    ctx.fillRect(-2, this.size / 2 - 4, 4, 8);
  }

  drawSupport(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
    // Cross
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-this.size / 3, 0);
    ctx.lineTo(this.size / 3, 0);
    ctx.moveTo(0, -this.size / 3);
    ctx.lineTo(0, this.size / 3);
    ctx.stroke();
  }

  drawBoss(ctx, color) {
    const frame = this.frame / 60;
    // Pulsating glow
    const pulse = Math.sin(frame * 3) * 0.3 + 0.7;
    ctx.shadowBlur = 20 * pulse;

    // Main body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -this.size / 2);
    ctx.lineTo(-this.size / 2, -this.size / 4);
    ctx.lineTo(-this.size / 1.5, this.size / 4);
    ctx.lineTo(-this.size / 3, this.size / 2);
    ctx.lineTo(this.size / 3, this.size / 2);
    ctx.lineTo(this.size / 1.5, this.size / 4);
    ctx.lineTo(this.size / 2, -this.size / 4);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-10, -5, 5, 0, Math.PI * 2);
    ctx.arc(10, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(-10, -5, 2, 0, Math.PI * 2);
    ctx.arc(10, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Wing cannons
    ctx.fillStyle = color;
    ctx.fillRect(-this.size / 1.5 - 6, this.size / 4 - 4, 12, 16);
    ctx.fillRect(this.size / 1.5 - 6, this.size / 4 - 4, 12, 16);

    // Rotating elements
    const rotAngle = frame * 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i + rotAngle;
      const ex = Math.cos(angle) * (this.size + 5);
      const ey = Math.sin(angle) * (this.size + 5);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.size + 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  getHitbox() {
    return { x: this.x, y: this.y, r: this.size / 2 };
  }
}
