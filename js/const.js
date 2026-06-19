// ============================================================
// CYBER INVADER - Game Constants
// ============================================================

export const CANVAS_W = 480;
export const CANVAS_H = 640;

// Player
export const PLAYER = {
  W: 24,
  H: 24,
  HITBOX_R: 5,          // Tiny hitbox for bullet-hell feel
  SPEED: 4,
  FOCUS_SPEED: 1.5,
  SHOT_COOLDOWN: 5,     // frames
  INVINCIBLE_FRAMES: 120,
  MAX_LIVES: 3,
  MAX_BOMBS: 5,
};

// Power-up levels
export const POWER_LEVELS = [
  { name: 'SINGLE',   bulletCount: 1,  spread: 0,      speed: 8,  color: '#0ff' },
  { name: 'DOUBLE',   bulletCount: 2,  spread: 0.15,   speed: 8,  color: '#0f8' },
  { name: 'TRIPLE',   bulletCount: 3,  spread: 0.25,   speed: 9,  color: '#0f0' },
  { name: 'QUAD',     bulletCount: 4,  spread: 0.35,   speed: 9,  color: '#ff0' },
  { name: 'WIDESHOT', bulletCount: 5,  spread: 0.5,    speed: 10, color: '#f80' },
];

// Enemy bullet types
export const BULLET_TYPES = {
  NORMAL:    { color: '#f44', size: 4, speed: 3, damage: 1 },
  FAST:      { color: '#ff0', size: 3, speed: 5, damage: 1 },
  HOMING:    { color: '#f0f', size: 5, speed: 2, damage: 1 },
  LASER:     { color: '#fff', size: 2, speed: 8, damage: 1 },
  GRAVITY:   { color: '#f80', size: 6, speed: 1.5, damage: 1 },
  SPLIT:     { color: '#0ff', size: 5, speed: 2.5, damage: 1 },
  BOSS:      { color: '#f00', size: 5, speed: 3, damage: 1 },
};

// Enemy types
export const ENEMY_TYPES = {
  GRUNT:     { hp: 1, score: 50,  size: 16, color: '#f44', fireRate: 90 },
  MEDIUM:    { hp: 3, score: 150, size: 24, color: '#f80', fireRate: 60 },
  TURRET:    { hp: 5, score: 300, size: 20, color: '#f0f', fireRate: 40 },
  SUPPORT:   { hp: 2, score: 200, size: 18, color: '#0ff', fireRate: 120 },
  BOSS:      { hp: 200, score: 5000, size: 60, color: '#f00', fireRate: 20 },
};

// Bomb types
export const BOMB_TYPES = {
  CLEAR: 'CLEAR',   // Clear all enemy bullets
  ABSORB: 'ABSORB', // Absorb damage for a duration
};

export const BOMB_ABSORB_DURATION = 180; // 3 seconds

// Stage durations (in frames at 60fps)
export const STAGE_DURATIONS = [
  600,   // Stage 1: 10s - Tutorial
  900,   // Stage 2: 15s - Formation + homing
  900,   // Stage 3: 15s - Laser + split
  900,   // Stage 4: 15s - Field gimmick
  600,   // Stage 5: 10s - Pre-boss
];

export const BOSS_DURATION = 1800; // 30s boss fight

// Colors
export const COLORS = {
  bg: '#000810',
  grid: 'rgba(0, 255, 255, 0.05)',
  gridBright: 'rgba(0, 255, 255, 0.15)',
  player: '#0ff',
  playerGlow: '#0ff',
  enemy: '#f44',
  bulletPlayer: '#0ff',
  bulletEnemy: '#f44',
  powerup: '#0f0',
  bomb: '#ff0',
  text: '#0ff',
  textAlt: '#f0f',
};

// Spawn timing helpers
export const FRAME = 1;
export const SEC = 60;
export const HALF = 30;
