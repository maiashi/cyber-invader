// ============================================================
// CYBER INVADER - Main Game
// ============================================================

import { CANVAS_W, CANVAS_H, PLAYER, BOMB_TYPES, BOMB_ABSORB_DURATION, COLORS } from './const.js';
import { Player } from './player.js';
import { PlayerBullet, EnemyBullet } from './bullet.js';
import { Enemy } from './enemy.js';
import { Particle, ParticleSystem } from './particle.js';
import { PowerUp } from './powerup.js';
import { audio } from './audio.js';
import { STAGES, BOSS, createSpawnConfig, createBoss, updateBossPhases, getPhaseName, getPhaseNameTimer, decrementPhaseNameTimer } from './stage.js';
import { rand, randInt, clamp } from './utils.js';

// Game state
const STATE = {
  TITLE: 'title',
  PLAYING: 'playing',
  STAGE_CLEAR: 'stageClear',
  BOSS: 'boss',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
};

// Canvas setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

// Game variables
let gameState = STATE.TITLE;
let frame = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem('cyberInvaderHighScore')) || 0;
let stage = 0;
let stageTimer = 0;
let stageTransition = 0;
let pendingSpawns = 0; // Track scheduled but not-yet-fired spawns
let shakeTimer = 0;
let shakeIntensity = 0;

// Game objects
const player = new Player();
let playerBullets = [];
let enemyBullets = [];
let enemies = [];
let powerUps = [];
let lasers = [];
const particles = new ParticleSystem();

// Input
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Background grid
const gridOffset = { x: 0, y: 0 };
const gridLines = [];
for (let x = 0; x < CANVAS_W; x += 40) gridLines.push({ type: 'v', x });
for (let y = 0; y < CANVAS_H; y += 40) gridLines.push({ type: 'h', y });

// Stars
const stars = [];
for (let i = 0; i < 60; i++) {
  stars.push({
    x: rand(0, CANVAS_W),
    y: rand(0, CANVAS_H),
    speed: rand(0.2, 1),
    size: rand(0.5, 1.5),
    brightness: rand(0.3, 0.8),
  });
}

// ============================================================
// Game Functions
// ============================================================

function startGame() {
  audio.init();
  audio.resume();
  score = 0;
  stage = 0;
  player.reset();
  playerBullets = [];
  enemyBullets = [];
  enemies = [];
  powerUps = [];
  lasers = [];
  particles.particles = [];
  startStage();
  gameState = STATE.PLAYING;
  hideAllScreens();
  updateHighScoreDisplay();
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('cyberInvaderHighScore', highScore);
  }
}

function updateHighScoreDisplay() {
  const hsText = `HIGH SCORE: ${highScore}`;
  const el1 = document.getElementById('high-score-display');
  if (el1) el1.textContent = hsText;
  const el2 = document.getElementById('game-over-highscore');
  if (el2) el2.textContent = hsText;
  const el3 = document.getElementById('victory-highscore');
  if (el3) el3.textContent = hsText;
  const el4 = document.getElementById('stage-clear-highscore');
  if (el4) el4.textContent = hsText;
}

function startStage() {
  stageTimer = 0;
  stageTransition = 60; // Transition time
  pendingSpawns = 0;
  enemies = [];
  playerBullets = [];
  enemyBullets = [];
  powerUps = [];
  lasers = [];

  // Give player invincibility at stage start (300 frames = 5 seconds)
  player.isInvincible = true;
  player.invincibleTimer = 300;

  if (stage < STAGES.length) {
    // Regular stage
    const stageDef = STAGES[stage];
    // Schedule spawns with delay so player has time to react
    for (const spawnDef of stageDef.spawns) {
      scheduleSpawn(spawnDef, spawnDef.time + 60);
    }
  } else {
    // Boss stage
    const boss = createBoss();
    enemies.push(boss);
    audio.bossAppear();
  }
}

function scheduleSpawn(spawnDef, delay) {
  pendingSpawns++;
  setTimeout(() => {
    pendingSpawns--;
    if (gameState !== STATE.PLAYING && gameState !== STATE.BOSS) return;
    const newEnemies = createSpawnConfig(null, spawnDef);
    enemies.push(...newEnemies);
  }, delay * (1000 / 60));
}

function nextStage() {
  stage++;
  if (stage < STAGES.length) {
    startStage();
    gameState = STATE.PLAYING;
  } else {
    startStage();
    gameState = STATE.BOSS;
  }
  hideAllScreens();
}

function showStageClear() {
  gameState = STATE.STAGE_CLEAR;
  audio.stageClear();
  document.getElementById('stage-clear-title').textContent = `STAGE ${stage + 1} CLEAR`;
  document.getElementById('stage-clear-score').textContent = `SCORE: ${score}`;
  updateHighScoreDisplay();
  showScreen('stage-clear-screen');
}

function showGameOver() {
  gameState = STATE.GAME_OVER;
  audio.gameOver();
  updateHighScore();
  document.getElementById('game-over-score').textContent = `SCORE: ${score}`;
  document.getElementById('game-over-stage').textContent = `STAGE: ${stage + 1}`;
  updateHighScoreDisplay();
  showScreen('game-over-screen');
}

function showVictory() {
  gameState = STATE.VICTORY;
  audio.stageClear();
  updateHighScore();
  document.getElementById('victory-score').textContent = `FINAL SCORE: ${score}`;
  updateHighScoreDisplay();
  showScreen('victory-screen');
}

function showScreen(id) {
  document.getElementById(id).classList.add('active');
}

function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

// ============================================================
// Update
// ============================================================

function update() {
  if (gameState !== STATE.PLAYING && gameState !== STATE.BOSS) return;

  frame++;

  // Stage transition
  if (stageTransition > 0) {
    stageTransition--;
    return;
  }

  // Increment stage timer
  stageTimer++;

  // Update player
  player.update(keys);

  // Player shot (auto-shoot)
  const newBullets = player.shoot();
  if (newBullets.length > 0) {
    playerBullets.push(...newBullets.map(b => new PlayerBullet(b.x, b.y, b.vx, b.vy, b.size, b.color)));
    // Only play audio on actual key press, not auto-shoot
    if (keys['z'] || keys['Z'] || keys[' ']) {
      audio.shoot();
    }
  }

  // Bomb
  if (keys['c'] || keys['C']) {
    keys['c'] = false;
    keys['C'] = false;
    useBomb();
  }

  // Toggle bomb type
  if (keys['v'] || keys['V']) {
    keys['v'] = false;
    keys['V'] = false;
    player.bombType = player.bombType === BOMB_TYPES.CLEAR ? BOMB_TYPES.ABSORB : BOMB_TYPES.CLEAR;
  }

  // Update player bullets
  for (const b of playerBullets) {
    b.update();
  }
  playerBullets = playerBullets.filter(b => b.alive);

  // Update enemies
  for (const e of enemies) {
    const newBullets = e.update(player.x, player.y, frame);
    if (newBullets) {
      enemyBullets.push(...newBullets);
    }

    // Boss phase update
    if (e.type === 'BOSS') {
      const phaseChanged = updateBossPhases(e);
      if (phaseChanged) {
        shakeTimer = 20;
        shakeIntensity = 10;
        lasers.push({ type: 'flash', life: 15, maxLife: 15 });
        particles.bigExplode(e.x, e.y, e.color, 50);
        particles.ringEffect(e.x, e.y, e.color, 4);
      }
    }
  }

  // Check split bullets
  for (const b of enemyBullets) {
    const splitBullets = b.getSplitBullets();
    if (splitBullets) {
      enemyBullets.push(...splitBullets);
    }
  }

  // Update enemy bullets
  for (const b of enemyBullets) {
    b.update(player.x, player.y);
  }
  enemyBullets = enemyBullets.filter(b => b.alive);

  // Update power-ups
  for (const p of powerUps) {
    p.update();
  }
  powerUps = powerUps.filter(p => p.alive);

  // Update lasers
  for (const l of lasers) {
    l.life--;
  }
  lasers = lasers.filter(l => l.life > 0);

  // Update particles
  particles.update();

  // Engine trail
  if (frame % 2 === 0) {
    particles.engineTrail(player.x, player.y + player.h / 2, '#0ff');
  }

  // Collision: player bullets vs enemies
  for (const b of playerBullets) {
    if (!b.alive) continue;
    for (const e of enemies) {
      if (!e.alive || e.entering) continue;
      if (b.hitsEnemy(e.x, e.y, e.size / 2)) {
        // Check shield
        if (e.shielded) {
          b.alive = false;
          e.shieldAbsorbCount--;
          // Shield break
          if (e.shieldAbsorbCount <= 0) {
            e.shielded = false;
            particles.bigExplode(e.x, e.y, '#0ff', 30);
            particles.ringEffect(e.x, e.y, '#0ff', 6);
            shakeTimer = 15;
            shakeIntensity = 8;
            audio.bigExplosion();
          }
          break; // Bullet absorbed by shield, stop checking
        }
        b.alive = false;
        const killed = e.hit(1);
        if (killed) {
          onEnemyKilled(e);
        }
        break;
      }
    }
  }

  // Collision: enemy bullets vs player
  const hitbox = player.getHitbox();
  for (const b of enemyBullets) {
    if (!b.alive) continue;
    if (b.hitsPlayer(hitbox.x, hitbox.y, hitbox.r)) {
      b.alive = false;
      const isDead = player.hit();
      audio.playerHit();
      shakeTimer = 10;
      shakeIntensity = 5;
      particles.explode(player.x, player.y, '#0ff', 10, 2, 3);
      if (isDead) {
        showGameOver();
        return;
      }
    }
  }

  // Collision: lasers vs player
  for (let i = lasers.length - 1; i >= 0; i--) {
    const l = lasers[i];
    if (l.type === 'laser') {
      // Simple line-circle check
      const dx = l.x2 - l.x1;
      const dy = l.y2 - l.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const t = clamp(((hitbox.x - l.x1) * dx + (hitbox.y - l.y1) * dy) / (len * len), 0, 1);
      const closestX = l.x1 + t * dx;
      const closestY = l.y1 + t * dy;
      const dist = Math.sqrt((hitbox.x - closestX) ** 2 + (hitbox.y - closestY) ** 2);
      if (dist < hitbox.r + 4) {
        const isDead = player.hit();
        audio.playerHit();
        shakeTimer = 10;
        shakeIntensity = 5;
        particles.explode(player.x, player.y, '#0ff', 10, 2, 3);
        // Remove laser after hitting player
        lasers.splice(i, 1);
        if (isDead) {
          showGameOver();
          return;
        }
      }
    }
  }

  // Collision: power-ups vs player
  for (const p of powerUps) {
    if (!p.alive) continue;
    if (p.hitsPlayer(player.x, player.y, player.w / 2)) {
      p.collect();
      if (p.type === 'POWER') {
        player.powerUp();
        audio.powerUp();
        particles.powerUpEffect(player.x, player.y);
      } else {
        player.addBomb();
        audio.powerUp();
        particles.powerUpEffect(player.x, player.y);
      }
    }
  }

  // Remove off-screen enemies (escaped below the screen)
  for (const e of enemies) {
    if (e.alive && e.y > CANVAS_H + 50) {
      e.alive = false;
    }
  }

  // Remove dead enemies
  enemies = enemies.filter(e => e.alive);

  // Check stage clear: all spawns fired AND no enemies alive (minimum 60 frames)
  if (stageTimer >= 60 && pendingSpawns === 0 && enemies.length === 0 && stageTransition <= 0) {
    if (stage < STAGES.length) {
      showStageClear();
    } else {
      showVictory();
    }
  }

  // Shake timer
  if (shakeTimer > 0) shakeTimer--;

  // Background grid scroll
  gridOffset.y = (gridOffset.y + 0.5) % 40;
}

function useBomb() {
  if (player.bombs <= 0) return;
  player.bombs--;
  audio.bomb();
  shakeTimer = 15;
  shakeIntensity = 8;

  if (player.bombType === BOMB_TYPES.CLEAR) {
    // Clear all enemy bullets
    enemyBullets = [];
    particles.bombEffect(CANVAS_W / 2, CANVAS_H / 2);
    // Flash effect
    lasers.push({
      type: 'flash',
      life: 10,
      maxLife: 10,
    });
  } else {
    // Absorb damage
    player.absorbTimer = BOMB_ABSORB_DURATION;
    particles.bombEffect(player.x, player.y);
  }
}

function onEnemyKilled(enemy) {
  score += enemy.score;
  audio.explosion();
  particles.explode(enemy.x, enemy.y, enemy.color, 15, 3, 4);

  // Power-up drop
  const stageDef = STAGES[stage] || { powerUpDrop: 0.2, bombDrop: 0.1 };
  if (Math.random() < stageDef.powerUpDrop) {
    powerUps.push(new PowerUp(enemy.x, enemy.y, 'POWER'));
  }
  // Bomb drop is independent of power-up drop
  if (Math.random() < stageDef.bombDrop) {
    powerUps.push(new PowerUp(enemy.x, enemy.y, 'BOMB'));
  }

  // Big explosion for bosses
  if (enemy.type === 'BOSS' || enemy.type === 'MEDIUM') {
    particles.bigExplode(enemy.x, enemy.y, enemy.color, 30);
    audio.bigExplosion();
    shakeTimer = 20;
    shakeIntensity = 8;
  }
}

// ============================================================
// Draw
// ============================================================

function draw() {
  ctx.save();

  // Screen shake
  if (shakeTimer > 0) {
    const sx = (Math.random() - 0.5) * shakeIntensity;
    const sy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(sx, sy);
  }

  // Clear
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Stars
  drawStars();

  // Grid
  drawGrid();

  // Lasers
  drawLasers();

  // Enemy bullets
  for (const b of enemyBullets) {
    b.draw(ctx);
  }

  // Player bullets
  for (const b of playerBullets) {
    b.draw(ctx);
  }

  // Enemies
  for (const e of enemies) {
    e.draw(ctx);
  }

  // Player
  player.draw(ctx);

  // Power-ups
  for (const p of powerUps) {
    p.draw(ctx);
  }

  // Particles
  particles.draw(ctx);

  // Stage name during transition
  drawStageName();

  // HUD
  drawHUD();

  // Phase name display
  if (getPhaseNameTimer() > 0) {
    decrementPhaseNameTimer();
    const alpha = Math.min(1, getPhaseNameTimer() / 30);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#f0f';
    ctx.shadowColor = '#f0f';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getPhaseName(), CANVAS_W / 2, CANVAS_H / 2 - 50);
    ctx.restore();
  }

  ctx.restore();
}

function drawStars() {
  for (const star of stars) {
    star.y += star.speed;
    if (star.y > CANVAS_H) {
      star.y = 0;
      star.x = rand(0, CANVAS_W);
    }
    ctx.fillStyle = `rgba(200, 220, 255, ${star.brightness})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
}

function drawGrid() {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;

  // Vertical lines
  for (const line of gridLines) {
    if (line.type === 'v') {
      ctx.beginPath();
      ctx.moveTo(line.x, 0);
      ctx.lineTo(line.x, CANVAS_H);
      ctx.stroke();
    }
  }

  // Horizontal lines (scrolling)
  for (const line of gridLines) {
    if (line.type === 'h') {
      const y = line.y + gridOffset.y;
      if (y <= CANVAS_H) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }
    }
  }

  // Bright intersection points
  ctx.fillStyle = COLORS.gridBright;
  const vSpacing = 40;
  const hSpacing = 40;
  for (let x = 0; x < CANVAS_W; x += vSpacing) {
    for (let y = gridOffset.y; y <= CANVAS_H; y += hSpacing) {
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
}

function drawLasers() {
  for (const l of lasers) {
    if (l.type === 'laser') {
      const alpha = l.life / 15;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      // Core
      ctx.strokeStyle = `rgba(200, 0, 0, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else if (l.type === 'flash') {
      const alpha = l.life / l.maxLife;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
  }
}

function drawStageName() {
  if (stageTransition > 0) {
    const alpha = stageTransition / 60;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#0ff';
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const stageDef = STAGES[stage];
    const bossDef = BOSS;
    const name = stage < STAGES.length ? stageDef.name : bossDef.name;
    const label = stage < STAGES.length ? `STAGE ${stage + 1}` : 'BOSS';

    ctx.fillText(label, CANVAS_W / 2, CANVAS_H / 2 - 20);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#f0f';
    ctx.fillText(name, CANVAS_W / 2, CANVAS_H / 2 + 15);
    ctx.restore();
  }
}

function drawHUD() {
  ctx.save();

  // Score
  ctx.fillStyle = '#0ff';
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 4;
  ctx.fillText(`SCORE ${score}`, 10, 10);

  // Stage
  ctx.fillStyle = '#f0f';
  ctx.textAlign = 'right';
  const stageLabel = stage < STAGES.length ? `STAGE ${stage + 1}` : 'BOSS';
  ctx.fillText(stageLabel, CANVAS_W - 10, 10);

  // Lives
  ctx.fillStyle = '#0ff';
  ctx.textAlign = 'left';
  ctx.fillText(`LIVES ${'♦'.repeat(player.lives)}`, 10, 28);

  // Power level
  const powerNames = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'WIDESHOT'];
  const powerColors = ['#0ff', '#0f8', '#0f0', '#ff0', '#f80'];
  ctx.fillStyle = powerColors[player.powerLevel];
  ctx.fillText(`PWR ${powerNames[player.powerLevel]}`, 10, 46);

  // Bombs
  ctx.fillStyle = '#ff0';
  ctx.textAlign = 'right';
  ctx.fillText(`BOMB ${'●'.repeat(player.bombs)}`, CANVAS_W - 10, 28);

  // Bomb type
  ctx.fillStyle = player.bombType === BOMB_TYPES.CLEAR ? '#0ff' : '#ff0';
  ctx.textAlign = 'right';
  ctx.fillText(`[${player.bombType}]`, CANVAS_W - 10, 46);

  // Focus indicator
  if (player.isFocus) {
    ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FOCUS', player.x, player.y + 20);
  }

  // Absorb shield indicator
  if (player.absorbTimer > 0) {
    ctx.fillStyle = '#ff0';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SHIELD ${Math.ceil(player.absorbTimer / 60)}s`, player.x, player.y + 32);
  }

  ctx.restore();
}

function drawTitleBg() {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawStars();
  drawGrid();
}

// ============================================================
// Game Loop
// ============================================================

let lastTime = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;
const MAX_DELTA = 200; // Cap delta to prevent huge jumps (e.g., tab switch)

function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  if (lastTime === 0) {
    lastTime = timestamp;
    return;
  }

  let delta = timestamp - lastTime;
  // Cap delta to prevent catching up after long pauses
  if (delta > MAX_DELTA) delta = MAX_DELTA;
  if (delta < FRAME_TIME * 0.5) return; // Skip if too soon

  lastTime = timestamp;

  // Title screen: just draw background
  if (gameState === STATE.TITLE) {
    drawTitleBg();
    return;
  }

  update();
  draw();
}

// ============================================================
// Event Handlers
// ============================================================

document.getElementById('start-btn').addEventListener('click', () => {
  startGame();
});

document.getElementById('next-stage-btn').addEventListener('click', () => {
  nextStage();
});

document.getElementById('retry-btn').addEventListener('click', () => {
  startGame();
});

document.getElementById('title-btn').addEventListener('click', () => {
  gameState = STATE.TITLE;
  hideAllScreens();
  showScreen('title-screen');
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  touchStartX = (touch.clientX - rect.left) * (CANVAS_W / rect.width);
  touchStartY = (touch.clientY - rect.top) * (CANVAS_H / rect.height);
  // Auto-shoot on touch
  keys['z'] = true;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const touchX = (touch.clientX - rect.left) * (CANVAS_W / rect.width);
  const touchY = (touch.clientY - rect.top) * (CANVAS_H / rect.height);
  const dx = touchX - touchStartX;
  const dy = touchY - touchStartY;
  keys['ArrowLeft'] = dx < -10;
  keys['ArrowRight'] = dx > 10;
  keys['ArrowUp'] = dy < -10;
  keys['ArrowDown'] = dy > 10;
});

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  keys['ArrowLeft'] = false;
  keys['ArrowRight'] = false;
  keys['ArrowUp'] = false;
  keys['ArrowDown'] = false;
  keys['z'] = false;
});

// Start game loop
requestAnimationFrame(gameLoop);
