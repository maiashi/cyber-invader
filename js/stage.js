// ============================================================
// CYBER INVADER - Stage Definitions
// ============================================================

import { ENEMY_TYPES, CANVAS_W, CANVAS_H, STAGE_DURATIONS, BOSS_DURATION } from './const.js';
import { Enemy } from './enemy.js';
import { rand, randInt, clamp } from './utils.js';

// Stage spawn configurations
export const STAGES = [
  // Stage 1: Tutorial - Basic grid, slow enemies
  {
    name: 'GRID INITIALIZATION',
    duration: STAGE_DURATIONS[0],
    spawns: [
      // Wave 1: Basic grunts
      { time: 0, type: 'GRUNT', count: 6, pattern: 'invader', moveSpeed: 0.5, fireRate: 120, bulletPattern: 'aimed' },
      // Wave 2: More grunts with spread fire
      { time: 120, type: 'GRUNT', count: 5, pattern: 'sine', moveSpeed: 1, fireRate: 90, bulletPattern: 'spread' },
      // Wave 3: Medium enemy
      { time: 240, type: 'MEDIUM', count: 1, pattern: 'static', fireRate: 80, bulletPattern: 'circle' },
      // Wave 4: Mixed
      { time: 360, type: 'GRUNT', count: 4, pattern: 'sine', moveSpeed: 1, fireRate: 80, bulletPattern: 'aimedSpread' },
      { time: 380, type: 'MEDIUM', count: 1, pattern: 'circle', moveSpeed: 1, fireRate: 70, bulletPattern: 'spiral' },
    ],
    powerUpDrop: 0.3,
    bombDrop: 0.1,
  },

  // Stage 2: Formation + homing
  {
    name: 'HOMING PROTOCOL',
    duration: STAGE_DURATIONS[1],
    spawns: [
      // Formation of grunts
      { time: 0, type: 'GRUNT', count: 8, pattern: 'invader', moveSpeed: 0.8, fireRate: 80, bulletPattern: 'aimedSpread' },
      // Homing support
      { time: 150, type: 'SUPPORT', count: 2, pattern: 'sine', moveSpeed: 1.2, fireRate: 100, bulletPattern: 'homing' },
      // Medium with circle pattern
      { time: 300, type: 'MEDIUM', count: 2, pattern: 'circle', moveSpeed: 1, fireRate: 60, bulletPattern: 'circle' },
      // Grunt wave
      { time: 450, type: 'GRUNT', count: 6, pattern: 'sine', moveSpeed: 1.5, fireRate: 60, bulletPattern: 'aimed' },
      // Homing support + turret
      { time: 600, type: 'SUPPORT', count: 1, pattern: 'static', fireRate: 90, bulletPattern: 'homing' },
      { time: 620, type: 'TURRET', count: 1, pattern: 'static', fireRate: 50, bulletPattern: 'aimedSpread' },
    ],
    powerUpDrop: 0.25,
    bombDrop: 0.1,
  },

  // Stage 3: Laser + split
  {
    name: 'FRACTURE SECTOR',
    duration: STAGE_DURATIONS[2],
    spawns: [
      // Turret with laser
      { time: 0, type: 'TURRET', count: 2, pattern: 'static', fireRate: 40, bulletPattern: 'laser' },
      // Grunts with split
      { time: 120, type: 'GRUNT', count: 6, pattern: 'sine', moveSpeed: 1.5, fireRate: 70, bulletPattern: 'split' },
      // Medium with double spiral
      { time: 280, type: 'MEDIUM', count: 2, pattern: 'sineV', moveSpeed: 1, fireRate: 55, bulletPattern: 'doubleSpiral' },
      // Support with homing
      { time: 400, type: 'SUPPORT', count: 2, pattern: 'circle', moveSpeed: 1.5, fireRate: 80, bulletPattern: 'homing' },
      // Turret + grunts
      { time: 550, type: 'TURRET', count: 1, pattern: 'static', fireRate: 35, bulletPattern: 'laser' },
      { time: 570, type: 'GRUNT', count: 5, pattern: 'sine', moveSpeed: 2, fireRate: 50, bulletPattern: 'aimed' },
      // Medium boss-like
      { time: 700, type: 'MEDIUM', count: 1, pattern: 'circle', moveSpeed: 0.8, fireRate: 45, bulletPattern: 'rotating', hp: 8 },
    ],
    powerUpDrop: 0.25,
    bombDrop: 0.1,
  },

  // Stage 4: Field gimmick (reflecting walls / narrow zones)
  {
    name: 'NARROW PASSAGE',
    duration: STAGE_DURATIONS[3],
    spawns: [
      // Tight formation
      { time: 0, type: 'GRUNT', count: 4, pattern: 'sine', moveSpeed: 1.5, fireRate: 60, bulletPattern: 'aimed' },
      // Turret with aimed spread
      { time: 150, type: 'TURRET', count: 2, pattern: 'static', fireRate: 40, bulletPattern: 'aimedSpread' },
      // Gravity bullets
      { time: 300, type: 'MEDIUM', count: 1, pattern: 'static', fireRate: 50, bulletPattern: 'gravity' },
      // Homing support
      { time: 450, type: 'SUPPORT', count: 2, pattern: 'sine', moveSpeed: 1.5, fireRate: 70, bulletPattern: 'homing' },
      // Mixed medium
      { time: 600, type: 'MEDIUM', count: 2, pattern: 'circle', moveSpeed: 1, fireRate: 50, bulletPattern: 'mixed' },
      // Final wave
      { time: 750, type: 'TURRET', count: 1, pattern: 'static', fireRate: 30, bulletPattern: 'laser' },
      { time: 770, type: 'GRUNT', count: 6, pattern: 'invader', moveSpeed: 1.5, fireRate: 45, bulletPattern: 'aimedSpread' },
    ],
    powerUpDrop: 0.2,
    bombDrop: 0.15,
  },

  // Stage 5: Pre-boss - composite patterns
  {
    name: 'FINAL APPROACH',
    duration: STAGE_DURATIONS[4],
    spawns: [
      // Opening salvo
      { time: 0, type: 'MEDIUM', count: 2, pattern: 'sineV', moveSpeed: 1, fireRate: 50, bulletPattern: 'doubleSpiral' },
      { time: 60, type: 'TURRET', count: 1, pattern: 'static', fireRate: 35, bulletPattern: 'laser' },
      // Support + grunts
      { time: 200, type: 'SUPPORT', count: 2, pattern: 'circle', moveSpeed: 1.5, fireRate: 70, bulletPattern: 'homing' },
      { time: 220, type: 'GRUNT', count: 8, pattern: 'invader', moveSpeed: 1.5, fireRate: 50, bulletPattern: 'aimedSpread' },
      // Heavy medium
      { time: 350, type: 'MEDIUM', count: 2, pattern: 'circle', moveSpeed: 0.8, fireRate: 40, bulletPattern: 'rotating', hp: 6 },
      // Final push
      { time: 480, type: 'TURRET', count: 2, pattern: 'static', fireRate: 30, bulletPattern: 'aimedSpread' },
      { time: 500, type: 'SUPPORT', count: 1, pattern: 'static', fireRate: 60, bulletPattern: 'mixed' },
    ],
    powerUpDrop: 0.2,
    bombDrop: 0.15,
  },
];

// Boss definition
export const BOSS = {
  name: 'CYBER CORE',
  duration: BOSS_DURATION,
  hp: 400,
  phases: [
    {
      // Phase 1: Standard attacks
      hpThreshold: 1.0,
      fireRate: 25,
      patterns: ['aimedSpread', 'circle', 'spiral'],
      name: 'PHASE 1: INITIALIZATION',
    },
    {
      // Phase 2: Aggressive
      hpThreshold: 0.7,
      fireRate: 20,
      patterns: ['aimedSpread', 'doubleSpiral', 'homing', 'laser'],
      name: 'PHASE 2: AGGRESSION',
    },
    {
      // Phase 3: Bullet hell
      hpThreshold: 0.4,
      fireRate: 15,
      patterns: ['rotating', 'wave', 'gravity', 'split', 'mixed'],
      name: 'PHASE 3: BULLET HELL',
    },
    {
      // Phase 4: Desperation
      hpThreshold: 0.15,
      fireRate: 10,
      patterns: ['aimedSpread', 'doubleSpiral', 'rotating', 'homing', 'mixed'],
      name: 'PHASE 4: DESPERATION',
    },
  ],
};

// Spawn enemies for a stage
export function createSpawnConfig(stage, spawnDef) {
  const enemies = [];
  const count = spawnDef.count;
  const spacing = CANVAS_W / (count + 1);

  for (let i = 0; i < count; i++) {
    const x = spacing * (i + 1);
    const y = 60 + randInt(0, 100);
    const enemy = new Enemy(spawnDef.type, x, y, {
      movePattern: spawnDef.pattern,
      moveSpeed: spawnDef.moveSpeed || 1,
      fireRate: spawnDef.fireRate,
      bulletPattern: spawnDef.bulletPattern,
      hp: spawnDef.hp || undefined,
    });
    enemy.enterTargetY = y;
    enemy.y = -30;
    enemies.push(enemy);
  }

  return enemies;
}

// Create boss
export function createBoss() {
  const boss = new Enemy('BOSS', CANVAS_W / 2, 80, {
    hp: BOSS.hp,
    movePattern: 'boss',
    fireRate: BOSS.phases[0].fireRate,
    bulletPattern: BOSS.phases[0].patterns[0],
    shielded: true,
    shieldMaxAbsorb: 120,
  });
  boss.enterTargetY = 80;
  boss.y = -80;
  boss.bossPhases = BOSS.phases;
  boss.currentPhase = 0;
  boss.patternIndex = 0;
  return boss;
}

// Update boss phases
export function updateBossPhases(boss) {
  const hpRatio = boss.hp / boss.maxHp;
  let newPhase = 0;

  for (let i = boss.bossPhases.length - 1; i >= 0; i--) {
    if (hpRatio <= boss.bossPhases[i].hpThreshold) {
      newPhase = i;
      break;
    }
  }

  let phaseChanged = false;
  if (newPhase !== boss.currentPhase) {
    phaseChanged = true;
    boss.currentPhase = newPhase;
    boss.fireRate = boss.bossPhases[newPhase].fireRate;
    boss.patternIndex = 0;
    // Phase change flash
    boss.flashTimer = 30;
    // Lose shield at phase 2
    if (newPhase >= 1) boss.shielded = false;
    // Phase name display
    const phaseName = boss.bossPhases[newPhase]?.name || `PHASE ${newPhase + 1}`;
    showPhaseName(phaseName);
  }

  // Cycle through patterns
  const phase = boss.bossPhases[boss.currentPhase];
  boss.bulletPattern = phase.patterns[boss.patternIndex % phase.patterns.length];
  boss.patternIndex++;

  return phaseChanged;
}

// Show phase change name
let phaseNameTimer = 0;
let phaseNameText = '';
function showPhaseName(name) {
  phaseNameText = name;
  phaseNameTimer = 120; // 2 seconds
}

// Get phase name for display
export function getPhaseName() {
  return phaseNameText;
}

// Get phase name timer
export function getPhaseNameTimer() {
  return phaseNameTimer;
}

// Decrement phase name timer
export function decrementPhaseNameTimer() {
  if (phaseNameTimer > 0) phaseNameTimer--;
}
