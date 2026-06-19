// ============================================================
// CYBER INVADER - Power-up System
// ============================================================

import { CANVAS_W, CANVAS_H } from './const.js';
import { rand } from './utils.js';

export class PowerUp {
  constructor(x, y, type = 'POWER') {
    this.x = x;
    this.y = y;
    this.type = type; // 'POWER' or 'BOMB'
    this.size = 10;
    this.speed = 1.5;
    this.alive = true;
    this.bobTimer = 0;
    this.collectFlash = 0;
  }

  update() {
    this.y += this.speed;
    this.bobTimer += 0.1;
    if (this.y > CANVAS_H + 20) this.alive = false;
    if (this.collectFlash > 0) this.collectFlash--;
  }

  draw(ctx) {
    const bobY = Math.sin(this.bobTimer) * 3;
    const flash = this.collectFlash > 0 ? 1.5 : 1;

    ctx.save();
    ctx.translate(this.x, this.y + bobY);

    if (this.type === 'POWER') {
      // Power-up: green diamond with P
      ctx.shadowColor = '#0f0';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#0f0';
      ctx.beginPath();
      ctx.moveTo(0, -this.size * flash);
      ctx.lineTo(this.size * flash, 0);
      ctx.lineTo(0, this.size * flash);
      ctx.lineTo(-this.size * flash, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', 0, 0);
    } else {
      // Bomb: yellow circle with B
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * flash, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('B', 0, 0);
    }

    ctx.restore();
  }

  collect() {
    this.alive = false;
    this.collectFlash = 10;
  }

  hitsPlayer(px, py, pr) {
    return Math.abs(this.x - px) < pr + this.size + 5 &&
           Math.abs(this.y - py) < pr + this.size + 5;
  }
}
