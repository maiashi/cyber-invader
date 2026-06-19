// ============================================================
// CYBER INVADER - Utilities
// ============================================================

import { CANVAS_W, CANVAS_H } from './const.js';

// Random range
export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// Random integer
export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

// Clamp value
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Distance between two points
export function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Angle from point A to point B
export function angleTo(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

// Check circle collision
export function circleCollision(x1, y1, r1, x2, y2, r2) {
  return dist(x1, y1, x2, y2) < r1 + r2;
}

// Check if point is within screen bounds
export function inBounds(x, y, margin = 0) {
  return x > margin && x < CANVAS_W - margin && y > margin && y < CANVAS_H - margin;
}

// Lerp
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Easing functions
export function easeOut(t) {
  return 1 - (1 - t) ** 2;
}

export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Generate evenly spaced angles
export function spreadAngles(count, baseAngle, spread) {
  const angles = [];
  const step = spread / (count - 1 || 1);
  for (let i = 0; i < count; i++) {
    angles.push(baseAngle - spread / 2 + step * i);
  }
  return angles;
}

// Polar to cartesian
export function polarToCart(cx, cy, r, angle) {
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  };
}

// Wrap angle to -PI..PI
export function wrapAngle(a) {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

// Create a color with alpha
export function rgba(r, g, b, a) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Hex to RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}
