/**
 * domains/solarSystem.ts — Solar system with orbiting planets.
 */

import { C, drawArrow, drawPlanet, drawSol } from "../core/shapes";
import { clamp01, easeOut, fadeIn } from "../core/easing";

type Ctx = any;

export const keywords = [
  "solar system",
  "planet",
  "asteroid",
  "comet",
  "galaxy",
  "star",
  "moon",
  "orbit",
  "milky way",
  "space",
  "cosmos",
  "earth",
  "mars",
  "jupiter",
  "gravity pull",
  "revolution",
  "rotation",
];

// Planet data: [distance from sun (fraction of W), size, color, speed factor]
const PLANETS = [
  { r: 0.12, size: 10, color: "#B0BEC5", speed: 4.7, name: "Mercury" },
  { r: 0.18, size: 14, color: "#FFB74D", speed: 3.5, name: "Venus" },
  { r: 0.26, size: 16, color: "#42A5F5", speed: 2.6, name: "Earth" },
  { r: 0.34, size: 13, color: "#EF5350", speed: 2.0, name: "Mars" },
  { r: 0.44, size: 26, color: "#FFCC80", speed: 1.1, name: "Jupiter" },
];

export function drawBackground(ctx: Ctx, W: number, H: number): void {
  ctx.fillStyle = C.space;
  ctx.fillRect(0, 0, W, H);
  // Stars
  const stars = [
    [55, 38], [130, 85], [210, 28], [360, 65], [510, 42],
    [660, 78], [728, 22], [782, 108], [82, 195], [305, 175],
    [555, 158], [705, 198], [450, 30], [600, 140], [200, 220],
    [700, 40], [100, 300], [750, 300], [350, 380], [620, 380],
  ];
  stars.forEach(([sx, sy]) => {
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.random() * 0.3;
    ctx.fillStyle = "#FFF9C4";
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

export function drawAnchorCharacters(
  ctx: Ctx,
  W: number,
  H: number,
  t: number,
): void {
  const sunX = W * 0.18;
  const sunY = H * 0.5;
  drawSol(ctx, sunX, sunY, 50, t, 1);

  // Draw orbit rings + orbiting planets
  PLANETS.forEach((p, i) => {
    const dist = p.r * W;
    const angle = t * p.speed * 0.3 + (i * Math.PI * 2) / PLANETS.length;
    const px = sunX + Math.cos(angle) * dist;
    const py = sunY + Math.sin(angle) * dist * 0.38; // perspective ellipse

    // Orbit ring
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#90A4AE";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(sunX, sunY, dist, dist * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    drawPlanet(ctx, px, py, p.size, 1, p.color);
  });
}

export function keywordFallback(
  ctx: Ctx,
  sceneText: string,
  elapsed: number,
  t: number,
  W: number,
  H: number,
): void {
  const txt = sceneText.toLowerCase();
  const sunX = W * 0.18;
  const sunY = H * 0.5;
  const a = fadeIn(elapsed, 200, 700);

  if (/orbit|revolve|revolution|move around/.test(txt)) {
    drawSol(ctx, sunX, sunY, 44, t, a);
    const dist = W * 0.3;
    const ang = t * 1.2;
    const px = sunX + Math.cos(ang) * dist;
    const py = sunY + Math.sin(ang) * dist * 0.35;
    ctx.save();
    ctx.globalAlpha = a * 0.2;
    ctx.strokeStyle = "#90A4AE"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(sunX, sunY, dist, dist * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    drawPlanet(ctx, px, py, 18, a, "#42A5F5");
    // orbit arrow
    const arrowA = fadeIn(elapsed, 800, 600);
    drawArrow(ctx, px, py - 24, -Math.PI * 0.6, 40, "#90A4AE", 2, arrowA);
    return;
  }

  if (/gravity|pull|attract/.test(txt)) {
    const earthA = fadeIn(elapsed, 300, 600);
    drawSol(ctx, sunX, sunY, 50, t, a);
    const ex = W * 0.65;
    const ey = H * 0.5;
    drawPlanet(ctx, ex, ey, 22, earthA, "#42A5F5");
    // gravity arrow pointing toward sun
    const gravA = fadeIn(elapsed, 700, 600);
    drawArrow(ctx, ex - 28, ey, Math.PI, easeOut(clamp01(elapsed / 1500)) * 120, "#90A4AE", 3, gravA);
    return;
  }

  if (/moon|satellite/.test(txt)) {
    drawSol(ctx, sunX, sunY, 40, t, a * 0.7);
    const earthX = W * 0.5;
    const moonAngle = t * 2.5;
    drawPlanet(ctx, earthX, H * 0.5, 22, a, "#42A5F5");
    drawPlanet(ctx, earthX + Math.cos(moonAngle) * 55, H * 0.5 + Math.sin(moonAngle) * 22, 9, a, "#E0E0E0");
    ctx.save();
    ctx.globalAlpha = a * 0.15;
    ctx.strokeStyle = "#90A4AE"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(earthX, H * 0.5, 55, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Default: sun + Earth
  drawSol(ctx, sunX, sunY, 44, t, a);
  const dist = W * 0.34;
  const ang = t * 0.9;
  drawPlanet(ctx, sunX + Math.cos(ang) * dist, sunY + Math.sin(ang) * dist * 0.36, 18, a, "#42A5F5");
  drawPlanet(ctx, sunX + Math.cos(ang + 1.5) * W * 0.2, sunY + Math.sin(ang + 1.5) * W * 0.075, 13, a * 0.9, "#EF5350");
}
