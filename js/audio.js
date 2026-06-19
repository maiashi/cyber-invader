// ============================================================
// CYBER INVADER - Audio System (Web Audio API)
// ============================================================

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a tone
  _tone(freq, duration, type = 'square', vol = 0.1) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol * this.volume;
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Silently ignore audio errors (common in rapid-fire scenarios)
    }
  }

  // Play noise burst
  _noise(duration, vol = 0.05) {
    if (!this.enabled || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.value = vol * this.volume;
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start();
    } catch (e) {
      // Silently ignore audio errors
    }
  }

  // Sound effects
  shoot() {
    this._tone(800, 0.05, 'square', 0.05);
  }

  enemyShoot() {
    this._tone(200, 0.08, 'sawtooth', 0.03);
  }

  explosion() {
    this._noise(0.2, 0.1);
    this._tone(100, 0.15, 'sawtooth', 0.05);
  }

  bigExplosion() {
    this._noise(0.5, 0.15);
    this._tone(60, 0.3, 'sawtooth', 0.08);
    this._tone(40, 0.5, 'sine', 0.06);
  }

  powerUp() {
    this._tone(523, 0.1, 'square', 0.08);
    setTimeout(() => this._tone(659, 0.1, 'square', 0.08), 80);
    setTimeout(() => this._tone(784, 0.15, 'square', 0.08), 160);
  }

  bomb() {
    this._noise(0.4, 0.2);
    this._tone(200, 0.3, 'sawtooth', 0.1);
  }

  playerHit() {
    this._tone(150, 0.2, 'sawtooth', 0.1);
    this._noise(0.15, 0.08);
  }

  stageClear() {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
    notes.forEach((n, i) => {
      setTimeout(() => this._tone(n, 0.15, 'square', 0.06), i * 80);
    });
  }

  gameOver() {
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((n, i) => {
      setTimeout(() => this._tone(n, 0.3, 'sawtooth', 0.08), i * 200);
    });
  }

  bossAppear() {
    this._tone(80, 0.5, 'sawtooth', 0.1);
    setTimeout(() => this._tone(60, 0.5, 'sawtooth', 0.1), 300);
    setTimeout(() => this._tone(40, 0.8, 'sawtooth', 0.12), 600);
  }
}

export const audio = new AudioSystem();
