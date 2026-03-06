import React from "react";
import { Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

// Inline copy of your standalone HTML demo.
// NOTE: All `${...}` sequences are escaped as `\${...}` so that
// this template literal is not interpolated by TypeScript.
const TEST_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Photosynthesis — Grade 6 Cartoon Player</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0F172A;
    font-family: 'Segoe UI', system-ui, sans-serif;
    display: flex; flex-direction: column;
    align-items: center; padding: 24px 16px;
    min-height: 100vh;
  }

  h1 {
    font-size: 20px; font-weight: 800;
    color: #F8FAFC; margin-bottom: 4px;
  }
  .subtitle { font-size: 12px; color: #64748B; margin-bottom: 20px; }

  .player {
    width: 100%; max-width: 860px;
    background: #1E293B; border-radius: 20px;
    border: 1px solid #334155; overflow: hidden;
  }

  /* Scene text banner */
  .scene-banner {
    background: #111827; padding: 10px 20px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .scene-text {
    font-size: 16px; font-weight: 700; color: #F8FAFC;
  }
  .scene-counter {
    font-size: 11px; color: #64748B; font-family: monospace;
  }

  canvas {
    display: block; width: 100%;
    background: #87CEEB; /* sky — set in JS */
  }

  /* Controls */
  .controls {
    padding: 14px 20px;
    display: flex; align-items: center; gap: 12px;
    border-top: 1px solid #334155;
  }
  button {
    padding: 8px 20px; border-radius: 10px; border: none;
    font-size: 13px; font-weight: 700; cursor: pointer;
    transition: all 0.15s;
  }
  .btn-play { background: #2563EB; color: #fff; }
  .btn-play:hover { background: #1D4ED8; }
  .btn-reset { background: #1E293B; color: #94A3B8; border: 1px solid #334155; }
  .btn-reset:hover { color: #F1F5F9; }

  .progress-wrap {
    flex: 1; height: 6px; background: #334155; border-radius: 3px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: #2563EB; border-radius: 3px;
    transition: width 0.1s linear;
  }
  .time-label { font-size: 11px; color: #64748B; font-family: monospace; min-width: 60px; text-align: right; }

  /* Scene strip */
  .strip-wrap {
    border-top: 1px solid #334155;
    padding: 12px 20px 16px;
  }
  .strip-label {
    font-size: 9px; font-weight: 800; color: #475569;
    letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px;
  }
  .strip {
    display: flex; gap: 8px; overflow-x: auto;
    scrollbar-width: thin; scrollbar-color: #334155 transparent;
  }
  .strip::-webkit-scrollbar { height: 4px; }
  .strip::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

  .thumb {
    flex-shrink: 0; width: 96px; border-radius: 10px;
    border: 1.5px solid #334155; background: #0F172A;
    padding: 8px; cursor: pointer; transition: all 0.15s;
  }
  .thumb:hover { border-color: #2563EB; background: #1E3A8A22; }
  .thumb.active { border-color: #2563EB; background: #1E3A8A33; }
  .thumb.done { opacity: 0.45; }

  .thumb-num {
    width: 18px; height: 18px; border-radius: 9px;
    background: #334155; color: #94A3B8;
    font-size: 9px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 5px;
  }
  .thumb.active .thumb-num { background: #2563EB; color: #fff; }
  .thumb.done .thumb-num { background: #16A34A44; color: #16A34A; }

  .thumb-text {
    font-size: 9px; color: #94A3B8; line-height: 1.4;
  }
  .thumb.active .thumb-text { color: #93C5FD; font-weight: 600; }

  canvas { cursor: pointer; }
</style>
</head>
<body>

<h1>🌿 How Plants Make Food</h1>
<p class="subtitle">Grade 6 · Photosynthesis · Tap Play to watch Sunny the Plant!</p>

<div class="player">
  <div class="scene-banner">
    <span class="scene-text" id="sceneText">Press ▶ Play to start!</span>
    <span class="scene-counter" id="sceneCounter">Scene 1 / 8</span>
  </div>

  <canvas id="mainCanvas" width="860" height="480"></canvas>

  <div class="controls">
    <button class="btn-play" id="btnPlay">▶ Play</button>
    <button class="btn-reset" id="btnReset">↺ Reset</button>
    <div class="progress-wrap">
      <div class="progress-fill" id="progressFill" style="width:0%"></div>
    </div>
    <span class="time-label" id="timeLabel">0:00 / 0:36</span>
  </div>

  <div class="strip-wrap">
    <div class="strip-label">SCENES — tap any to jump</div>
    <div class="strip" id="sceneStrip"></div>
  </div>
</div>

<script>
const canvas  = document.getElementById('mainCanvas');
const ctx     = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  sky1: '#87CEEB', sky2: '#B0E0FF',
  ground: '#5D4037', grass: '#4CAF50', grassDark: '#388E3C',
  sunY: '#FFD700', sunO: '#FFA000',
  leafG: '#2E7D32', leafL: '#66BB6A', leafHL: '#A5D6A7',
  stemBrown: '#6D4C41',
  waterB: '#29B6F6', waterHL: '#81D4FA',
  co2: '#B0BEC5', co2text: '#546E7A',
  glucose: '#FF8F00', glucoseHL: '#FFD54F',
  energy: '#AB47BC', energyHL: '#CE93D8',
  arrowBlue: '#1565C0',
  textDark: '#1A237E', textWhite: '#FFFFFF',
  bubbleO2: '#A5D6A7',
};

// ─── SCENE DEFINITIONS ───────────────────────────────────────────────────────
const SCENE_DURATION = 4500;
const TOTAL_DURATION = SCENE_DURATION * 8;

const SCENES = [
  { text: "🌱 Sunny the plant loves sunlight!",           hint: "Green plants use light." },
  { text: "☀️ Sunlight travels down to Sunny!",           hint: "Light makes energy." },
  { text: "⚡ Light turns into chemical energy!",         hint: "Energy is chemical." },
  { text: "🔬 Energy works inside the leaf!",             hint: "Energy occurs inside." },
  { text: "💨 Sunny breathes in Carbon Dioxide (CO₂)!",  hint: "Plants take in CO₂." },
  { text: "💧 Sunny drinks water through her roots!",     hint: "Plants take in water." },
  { text: "🍬 Water + CO₂ + Energy = Glucose!",          hint: "Water makes glucose." },
  { text: "🎉 Glucose is Sunny's yummy food!",            hint: "Glucose is plant food." },
];

// ─── EASING ──────────────────────────────────────────────────────────────────
const ease = {
  out:    t => t*(2-t),
  inOut:  t => t<0.5 ? 2*t*t : -1+(4-2*t)*t,
  bounce: t => {
    if (t < 1/2.75) return 7.5625*t*t;
    if (t < 2/2.75) return 7.5625*(t-=1.5/2.75)*t+0.75;
    if (t < 2.5/2.75) return 7.5625*(t-=2.25/2.75)*t+0.9375;
    return 7.5625*(t-=2.625/2.75)*t+0.984375;
  },
};

const lerp    = (a,b,t) => a+(b-a)*t;
const clamp01 = t => Math.max(0, Math.min(1, t));
const fadeIn  = (e, start=0, dur=600) => clamp01((e-start)/dur);
const fadeOut = (e, start, dur=400)   => clamp01(1-(e-start)/dur);

// ─── DRAWING PRIMITIVES ──────────────────────────────────────────────────────

function drawRoundRect(x,y,w,h,r,fill,stroke,sw=0) {
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,r);
  if (fill)  { ctx.fillStyle=fill; ctx.fill(); }
  if (stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=sw; ctx.stroke(); }
}

function drawSpeechBubble(text, x, y, a=1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const pad = 10, fontSize = 13;
  ctx.font = \`bold \${fontSize}px 'Segoe UI', sans-serif\`;
  const tw = ctx.measureText(text).width;
  const bw = tw + pad*2, bh = 30;
  const bx = x - bw/2, by = y - bh - 14;
  // shadow
  ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowBlur=8; ctx.shadowOffsetY=3;
  drawRoundRect(bx,by,bw,bh,8,'#FFFFFF','#E0E0E0',1);
  ctx.shadowColor='transparent';
  // tail
  ctx.fillStyle='#FFFFFF';
  ctx.beginPath(); ctx.moveTo(x-8,by+bh); ctx.lineTo(x+8,by+bh); ctx.lineTo(x,by+bh+14); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#E0E0E0'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x-7,by+bh+1); ctx.lineTo(x,by+bh+13); ctx.lineTo(x+7,by+bh+1); ctx.stroke();
  // text
  ctx.fillStyle='#1A237E'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text, x, by+bh/2);
  ctx.restore();
}

// ── BACKGROUND ───────────────────────────────────────────────────────────────
function drawBackground() {
  // Sky gradient
  const sky = ctx.createLinearGradient(0,0,0,H*0.65);
  sky.addColorStop(0,'#64B5F6'); sky.addColorStop(1,'#B3E5FC');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H*0.65);

  // Ground
  ctx.fillStyle='#8D6E63'; ctx.fillRect(0,H*0.65,W,H*0.35);

  // Grass strip
  ctx.fillStyle=C.grass;
  ctx.beginPath(); ctx.ellipse(W/2,H*0.65,W*0.7,18,0,0,Math.PI*2); ctx.fill();
  ctx.fillRect(0,H*0.65,W,16);

  // Subtle ground texture lines
  ctx.strokeStyle='rgba(0,0,0,0.06)'; ctx.lineWidth=1;
  for(let i=0;i<4;i++){
    const gy = H*0.65+30+i*28;
    ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke();
  }

  // Clouds (static, cute)
  drawCloud(120, 70, 0.9);
  drawCloud(600, 50, 0.7);
  drawCloud(380, 90, 0.55);
}

function drawCloud(cx, cy, scale) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(100,181,246,0.4)';
  ctx.shadowBlur = 8;
  const r = 22*scale;
  [[0,0,r],[r*0.9,-r*0.3,r*0.8],[r*1.8,r*0.1,r*0.9],[r*-0.9,-r*0.2,r*0.75]].forEach(([dx,dy,rad]) => {
    ctx.beginPath(); ctx.arc(cx+dx,cy+dy,rad,0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

// ── SUNNY THE PLANT (main character) ────────────────────────────────────────
// Drawn at (cx, groundY) — cx = horizontal centre
function drawSunny(cx, groundY, wobble=0, glowing=false, scale=1) {
  ctx.save();
  ctx.translate(cx, groundY);
  ctx.scale(scale, scale);

  // Root hint (underground, barely visible)
  ctx.save(); ctx.globalAlpha=0.35;
  ctx.strokeStyle='#5D4037'; ctx.lineWidth=3; ctx.lineCap='round';
  [[-18,0,-28,28],[-10,0,-8,32],[10,0,18,30],[18,0,26,26]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });
  ctx.restore();

  // Stem
  const stemSway = Math.sin(wobble) * 4;
  ctx.strokeStyle=C.stemBrown; ctx.lineWidth=9; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(stemSway,-40, stemSway*0.5,-80, stemSway*1.2,-130); ctx.stroke();
  // Stem highlight
  ctx.strokeStyle='#A1887F'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(-2,0); ctx.bezierCurveTo(stemSway-2,-40, stemSway*0.5-2,-80, stemSway*1.2-2,-130); ctx.stroke();

  // Left leaf
  ctx.save();
  ctx.translate(stemSway*0.6-10, -80);
  ctx.rotate(-0.55 + Math.sin(wobble*0.7)*0.05);
  drawLeafShape(0,0,48,22,C.leafG,C.leafL,C.leafHL);
  ctx.restore();

  // Right leaf
  ctx.save();
  ctx.translate(stemSway*0.8+10, -100);
  ctx.rotate(0.6 + Math.sin(wobble*0.7+1)*0.05);
  ctx.scale(-1,1);
  drawLeafShape(0,0,44,20,C.leafG,C.leafL,C.leafHL);
  ctx.restore();

  // Top big leaf / crown
  ctx.save();
  ctx.translate(stemSway*1.2, -138);
  ctx.rotate(Math.sin(wobble*0.5)*0.06);
  drawLeafShape(0,0,55,25,C.leafDark ?? C.leafG,C.leafL,C.leafHL);
  ctx.restore();

  // Face on stem — cute emoji style
  const fx = stemSway*0.7, fy = -55;
  // face circle
  ctx.fillStyle='#A5D6A7';
  ctx.beginPath(); ctx.arc(fx, fy, 18, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle=C.leafG; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(fx, fy, 18, 0, Math.PI*2); ctx.stroke();
  // eyes
  ctx.fillStyle='#1B5E20';
  ctx.beginPath(); ctx.arc(fx-6, fy-4, 3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(fx+6, fy-4, 3, 0, Math.PI*2); ctx.fill();
  // eye shine
  ctx.fillStyle='#FFFFFF';
  ctx.beginPath(); ctx.arc(fx-5, fy-5, 1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(fx+7, fy-5, 1, 0, Math.PI*2); ctx.fill();
  // smile
  ctx.strokeStyle='#1B5E20'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(fx, fy+1, 6, 0.2, Math.PI-0.2); ctx.stroke();

  // Glow effect when absorbing / glowing
  if (glowing) {
    ctx.save();
    ctx.globalAlpha = 0.25 + Math.sin(wobble*3)*0.1;
    const grd = ctx.createRadialGradient(fx,fy-60,10, fx,fy-60,80);
    grd.addColorStop(0,'#A5D6A7'); grd.addColorStop(1,'rgba(165,214,167,0)');
    ctx.fillStyle=grd;
    ctx.beginPath(); ctx.arc(fx,fy-60,80,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawLeafShape(cx, cy, len, halfW, dark, mid, light) {
  // Main leaf body
  ctx.fillStyle=mid;
  ctx.beginPath();
  ctx.moveTo(cx-len,cy);
  ctx.bezierCurveTo(cx-len*0.5,cy-halfW, cx,cy-halfW*0.5, cx,cy);
  ctx.bezierCurveTo(cx,cy+halfW*0.5, cx-len*0.5,cy+halfW, cx-len,cy);
  ctx.closePath(); ctx.fill();
  // Dark underside
  ctx.fillStyle=dark; ctx.globalAlpha=0.35;
  ctx.beginPath();
  ctx.moveTo(cx-len,cy);
  ctx.bezierCurveTo(cx-len*0.5,cy, cx,cy+halfW*0.3, cx,cy);
  ctx.bezierCurveTo(cx-len*0.5,cy+halfW, cx-len*0.5,cy+halfW*0.5, cx-len,cy);
  ctx.closePath(); ctx.fill(); ctx.globalAlpha=1;
  // Midrib
  ctx.strokeStyle=dark; ctx.lineWidth=1.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx-len,cy); ctx.lineTo(cx-len*0.05,cy); ctx.stroke();
  // Veins
  ctx.strokeStyle=light; ctx.lineWidth=0.8; ctx.globalAlpha=0.6;
  [0.3,0.5,0.7].forEach(t => {
    const vx = cx-len+len*t;
    ctx.beginPath(); ctx.moveTo(vx,cy); ctx.lineTo(vx-len*0.1,cy-halfW*0.7*t); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vx,cy); ctx.lineTo(vx-len*0.1,cy+halfW*0.7*t); ctx.stroke();
  });
  ctx.globalAlpha=1;
  // Highlight
  ctx.fillStyle='rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(cx-len,cy);
  ctx.bezierCurveTo(cx-len*0.6,cy-halfW*0.7, cx-len*0.3,cy-halfW*0.5, cx-len*0.1,cy-halfW*0.3);
  ctx.bezierCurveTo(cx-len*0.3,cy-halfW*0.1, cx-len*0.6,cy-halfW*0.1, cx-len,cy);
  ctx.closePath(); ctx.fill();
}

// ── SUN CHARACTER ────────────────────────────────────────────────────────────
function drawSunCharacter(cx, cy, r, wobble, alpha=1) {
  ctx.save(); ctx.globalAlpha=alpha;

  // Outer glow
  const grd = ctx.createRadialGradient(cx,cy,r*0.5, cx,cy,r*2.2);
  grd.addColorStop(0,'rgba(255,235,0,0.5)');
  grd.addColorStop(0.5,'rgba(255,180,0,0.2)');
  grd.addColorStop(1,'rgba(255,150,0,0)');
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,r*2.2,0,Math.PI*2); ctx.fill();

  // Rays — animated wobble
  for (let i=0;i<12;i++) {
    const angle = (i/12)*Math.PI*2 + wobble*0.02;
    const rLen  = r*0.45 + Math.sin(wobble + i*0.8)*r*0.1;
    const inner = r+4, outer = r+4+rLen;
    const g = ctx.createLinearGradient(
      cx+Math.cos(angle)*inner, cy+Math.sin(angle)*inner,
      cx+Math.cos(angle)*outer, cy+Math.sin(angle)*outer
    );
    g.addColorStop(0,'rgba(255,215,0,0.95)');
    g.addColorStop(1,'rgba(255,215,0,0)');
    ctx.strokeStyle=g; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(angle)*inner, cy+Math.sin(angle)*inner);
    ctx.lineTo(cx+Math.cos(angle)*outer, cy+Math.sin(angle)*outer);
    ctx.stroke();
  }

  // Body
  const body = ctx.createRadialGradient(cx-r*0.25,cy-r*0.25,0, cx,cy,r);
  body.addColorStop(0,'#FFF9C4'); body.addColorStop(0.4,'#FFE000');
  body.addColorStop(0.8,'#FFA000'); body.addColorStop(1,'#E65100');
  ctx.fillStyle=body; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();

  // Face
  ctx.fillStyle='#E65100'; ctx.beginPath(); ctx.arc(cx-r*0.3, cy-r*0.15, r*0.12, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+r*0.3, cy-r*0.15, r*0.12, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#FFF9C4'; ctx.beginPath(); ctx.arc(cx-r*0.28,cy-r*0.17, r*0.05, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+r*0.32,cy-r*0.17, r*0.05, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle='#E65100'; ctx.lineWidth=r*0.08; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(cx, cy+r*0.1, r*0.22, 0.1, Math.PI-0.1); ctx.stroke();
  // Cheeks
  ctx.fillStyle='rgba(255,100,0,0.2)';
  ctx.beginPath(); ctx.ellipse(cx-r*0.55, cy+r*0.05, r*0.18, r*0.1, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+r*0.55, cy+r*0.05, r*0.18, r*0.1, 0, 0, Math.PI*2); ctx.fill();

  ctx.restore();
}

// ── LIGHT RAYS ───────────────────────────────────────────────────────────────
function drawLightBeam(x1,y1,x2,y2,alpha, color='#FFE082') {
  ctx.save(); ctx.globalAlpha=alpha;
  const g = ctx.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,color); g.addColorStop(1,'rgba(255,224,130,0)');
  ctx.strokeStyle=g; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.setLineDash([10,8]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ── ENERGY BOLT ──────────────────────────────────────────────────────────────
function drawEnergyBolt(cx, cy, size, alpha) {
  ctx.save(); ctx.globalAlpha=alpha;
  // Glow
  ctx.shadowColor='#CE93D8'; ctx.shadowBlur=20;
  ctx.fillStyle=C.energy;
  ctx.beginPath();
  ctx.moveTo(cx+size*0.25, cy-size);
  ctx.lineTo(cx-size*0.3,  cy+size*0.1);
  ctx.lineTo(cx+size*0.08, cy+size*0.1);
  ctx.lineTo(cx-size*0.25, cy+size);
  ctx.lineTo(cx+size*0.38, cy-size*0.05);
  ctx.lineTo(cx-size*0.05, cy-size*0.05);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur=0;
  // Highlight
  ctx.fillStyle=C.energyHL; ctx.globalAlpha=alpha*0.5;
  ctx.beginPath();
  ctx.moveTo(cx+size*0.1, cy-size*0.8);
  ctx.lineTo(cx-size*0.1, cy+size*0.05);
  ctx.lineTo(cx+size*0.05, cy+size*0.05);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ── WATER DROP ───────────────────────────────────────────────────────────────
function drawWaterDrop(cx, cy, r, alpha) {
  ctx.save(); ctx.globalAlpha=alpha;
  ctx.fillStyle=C.waterB; ctx.strokeStyle='#0288D1'; ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy-r*1.5);
  ctx.bezierCurveTo(cx+r, cy-r*0.3, cx+r, cy+r*0.7, cx, cy+r);
  ctx.bezierCurveTo(cx-r, cy+r*0.7, cx-r, cy-r*0.3, cx, cy-r*1.5);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Highlight
  ctx.fillStyle='rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.ellipse(cx-r*0.3, cy-r*0.6, r*0.28, r*0.4, -0.5, 0, Math.PI*2); ctx.fill();
  // Face
  ctx.fillStyle='#0288D1';
  ctx.beginPath(); ctx.arc(cx-r*0.3, cy+r*0.1, r*0.12, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+r*0.3, cy+r*0.1, r*0.12, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle='#0288D1'; ctx.lineWidth=r*0.1; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(cx, cy+r*0.4, r*0.22, 0.1, Math.PI-0.1); ctx.stroke();
  ctx.restore();
}

// ── CO2 BUBBLE ───────────────────────────────────────────────────────────────
function drawCO2Bubble(cx, cy, r, alpha) {
  ctx.save(); ctx.globalAlpha=alpha;
  ctx.fillStyle='rgba(176,190,197,0.3)'; ctx.strokeStyle=C.co2; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
  // Label inside
  ctx.fillStyle=C.co2text; ctx.font=\`bold \${r*0.65}px 'Segoe UI'\`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('CO₂', cx, cy);
  // Highlight
  ctx.fillStyle='rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.ellipse(cx-r*0.3, cy-r*0.35, r*0.25, r*0.18, -0.5, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

// ── GLUCOSE HEXAGON ──────────────────────────────────────────────────────────
function drawGlucose(cx, cy, r, alpha, pulse=1) {
  ctx.save(); ctx.globalAlpha=alpha;
  ctx.translate(cx,cy); ctx.scale(pulse,pulse);
  // Glow
  const glow = ctx.createRadialGradient(0,0,r*0.5, 0,0,r*1.8);
  glow.addColorStop(0,'rgba(255,143,0,0.35)'); glow.addColorStop(1,'rgba(255,143,0,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(0,0,r*1.8,0,Math.PI*2); ctx.fill();
  // Hexagon body
  ctx.fillStyle=C.glucose; ctx.strokeStyle='#E65100'; ctx.lineWidth=2.5;
  ctx.beginPath();
  for(let i=0;i<6;i++){
    const a=(i/6)*Math.PI*2-Math.PI/6;
    if(i===0) ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
    else ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // Inner highlight
  ctx.fillStyle=C.glucoseHL; ctx.globalAlpha=0.5;
  ctx.beginPath();
  for(let i=0;i<6;i++){
    const a=(i/6)*Math.PI*2-Math.PI/6;
    const rr=r*0.55;
    if(i===0) ctx.moveTo(Math.cos(a)*rr, Math.sin(a)*rr);
    else ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr);
  }
  ctx.closePath(); ctx.fill(); ctx.globalAlpha=alpha;
  // Label
  ctx.fillStyle='#FFFFFF'; ctx.font=\`bold \${r*0.38}px 'Segoe UI'\`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('C₆H₁₂O₆',0,0);
  ctx.restore();
}

// ── SIGNALING ARROW ──────────────────────────────────────────────────────────
function drawArrow(x,y,dir='down',alpha=1,label='') {
  ctx.save(); ctx.globalAlpha=alpha;
  ctx.strokeStyle=C.arrowBlue; ctx.fillStyle=C.arrowBlue; ctx.lineWidth=2.5; ctx.lineCap='round';
  const len=22, hs=8;
  if(dir==='down') {
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+len); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-hs,y+len-hs); ctx.lineTo(x,y+len+2); ctx.lineTo(x+hs,y+len-hs); ctx.fill();
  } else if(dir==='right') {
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+len,y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+len-hs,y-hs); ctx.lineTo(x+len+2,y); ctx.lineTo(x+len-hs,y+hs); ctx.fill();
  } else if(dir==='left') {
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-len,y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-len+hs,y-hs); ctx.lineTo(x-len-2,y); ctx.lineTo(x-len+hs,y+hs); ctx.fill();
  }
  if(label) {
    ctx.fillStyle='#1565C0'; ctx.font='bold 10px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='top';
    const ly = dir==='down' ? y+len+10 : y-16;
    const lx = dir==='down' ? x : (dir==='right' ? x+len+4 : x-len-4);
    // Pill bg
    const tw=ctx.measureText(label).width+10;
    ctx.fillStyle='rgba(21,101,192,0.12)'; ctx.beginPath(); ctx.roundRect(lx-tw/2,ly-2,tw,16,4); ctx.fill();
    ctx.fillStyle='#1565C0'; ctx.fillText(label,lx,ly);
  }
  ctx.restore();
}

// ── ROOTS (animated) ─────────────────────────────────────────────────────────
function drawRoots(cx, groundY, alpha) {
  ctx.save(); ctx.globalAlpha=alpha;
  ctx.strokeStyle='#5D4037'; ctx.lineWidth=4; ctx.lineCap='round';
  const roots = [
    [cx,groundY, cx-40,groundY+50, cx-60,groundY+80],
    [cx,groundY, cx-15,groundY+55, cx-20,groundY+90],
    [cx,groundY, cx+10,groundY+60, cx+5, groundY+95],
    [cx,groundY, cx+35,groundY+50, cx+55,groundY+75],
  ];
  roots.forEach(([x1,y1,x2,y2,x3,y3]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(x2,y2,x3,y3); ctx.stroke();
  });
  ctx.restore();
}

// ─── SCENE RENDERERS ─────────────────────────────────────────────────────────
// Each renderer: (elapsed ms since scene start)
// All use drawBackground() first, then build up the story

const cx   = W/2 - 40;  // plant center x (slightly left so room for sun)
const gndY = H * 0.65;  // ground y
const sunCX = W*0.78, sunCY = H*0.14;

function scene1(e, t) {
  // "Green plants use light" — introduce Sunny and the sun
  drawBackground();
  const a = fadeIn(e,0);
  const plantA = ease.bounce(clamp01(e/800));
  drawSunny(cx, gndY, t, false, plantA);
  drawSunCharacter(sunCX, sunCY, 52, t, a);
  if(e>1000) drawSpeechBubble("Hi! I'm Sunny! 🌱", cx, gndY-155, fadeIn(e,1000));
  if(e>2500) drawSpeechBubble("I love sunlight! ☀️", sunCX, sunCY-65, fadeIn(e,2500));
}

function scene2(e, t) {
  // "Light makes energy" — ray travels from sun to plant
  drawBackground();
  const a = fadeIn(e,0);
  drawSunCharacter(sunCX, sunCY, 52, t, 1);
  drawSunny(cx, gndY, t, false);

  // 3 staggered rays from sun to plant
  [0,180,360].forEach((delay,i) => {
    const ra = fadeIn(e, delay, 500);
    const wobble = Math.sin(t*0.05+i)*8;
    drawLightBeam(sunCX-40, sunCY+25, cx+20+wobble, gndY-120, ra*0.85);
  });

  if(e>1200) {
    const bang = fadeIn(e,1200,400);
    // sparkles on leaf
    for(let i=0;i<5;i++){
      const ang=(i/5)*Math.PI*2+t*0.03;
      const sr=28+i*6;
      ctx.save(); ctx.globalAlpha=bang*0.7;
      ctx.fillStyle='#FFD700';
      ctx.beginPath(); ctx.arc(cx+Math.cos(ang)*sr, gndY-130+Math.sin(ang)*sr, 3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }
  if(e>2000) drawSpeechBubble("Light energy hits me!", cx, gndY-160, fadeIn(e,2000,600));
  if(e>1000) drawArrow(sunCX-60, sunCY+50, 'down', fadeIn(e,1000,500)*0.7, 'LIGHT');
}

function scene3(e, t) {
  // "Energy is chemical" — bolt appears, transforms to hexagon outline
  drawBackground();
  drawSunCharacter(sunCX, sunCY, 52, t, 0.6);
  drawSunny(cx, gndY, t, true);

  const boltA = fadeIn(e,0,600);
  const boltFade = e > 2200 ? fadeOut(e,2200,800) : 1;
  drawEnergyBolt(cx+80, gndY-100, 36, boltA*boltFade);

  if(e>1400) {
    const hexA = fadeIn(e,1400,700);
    drawGlucose(cx+80, gndY-100, 34, hexA*0.55, 1);
    drawArrow(cx+80, gndY-58, 'down', hexA, 'CHEMICAL');
  }

  if(e>600)  drawArrow(sunCX-50, sunCY+40, 'left', fadeIn(e,600,400)*0.6);
  if(e>2000) drawSpeechBubble("Light → Chemical energy! ⚡→🔬", cx, gndY-175, fadeIn(e,2000,500));
}

function scene4(e, t) {
  // "Energy occurs inside (chloroplast)" — zoom effect, leaf glows
  drawBackground();
  drawSunCharacter(sunCX, sunCY, 52, t, 0.5);
  drawSunny(cx, gndY, t, true);

  // Chloroplast "bubble" inside leaf area
  const pulse = 0.9 + Math.sin(t*0.08)*0.08;
  const chlA = fadeIn(e,300,600);
  ctx.save();
  ctx.globalAlpha = chlA*0.4;
  const chlGrd = ctx.createRadialGradient(cx-5, gndY-105, 5, cx-5, gndY-105, 48*pulse);
  chlGrd.addColorStop(0,'#A5D6A7'); chlGrd.addColorStop(1,'rgba(165,214,167,0)');
  ctx.fillStyle=chlGrd; ctx.beginPath(); ctx.arc(cx-5, gndY-105, 48*pulse, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  ctx.save(); ctx.globalAlpha=chlA;
  ctx.strokeStyle='#2E7D32'; ctx.lineWidth=2; ctx.lineDash=[4,3];
  ctx.beginPath(); ctx.ellipse(cx-5, gndY-105, 40*pulse, 26*pulse, -0.3, 0, Math.PI*2);
  ctx.stroke(); ctx.restore();
  ctx.setLineDash([]);

  if(e>800)  drawEnergyBolt(cx-5, gndY-105, 18, fadeIn(e,800,500)*pulse);
  if(e>1500) drawArrow(cx-5, gndY-75, 'down', fadeIn(e,1500), 'CHLOROPLAST');
  if(e>2200) drawSpeechBubble("Inside my chloroplasts! 🔬", cx, gndY-175, fadeIn(e,2200,500));
}

function scene5(e, t) {
  // "Plants take in CO2" — bubbles drift in from right
  drawBackground();
  drawSunCharacter(sunCX, sunCY, 52, t, 0.5);
  drawSunny(cx, gndY, t, false);

  // 3 CO2 bubbles at different speeds/positions
  [0, 300, 600].forEach((delay, i) => {
    const travel = clamp01((e-delay)/2400);
    const bx = W*0.9 - travel*(W*0.9 - (cx+30+i*10));
    const by = gndY - 80 - i*35 + Math.sin(t*0.05+i*2)*12;
    const ba = fadeIn(e, delay, 400);
    drawCO2Bubble(bx, by, 26, ba);
    if(travel>0.75 && ba>0) drawArrow(bx-32, by, 'left', ba*0.8, i===1?'ABSORBED':'');
  });

  if(e>2400) drawSpeechBubble("I breathe in CO₂! 😮‍💨", cx, gndY-165, fadeIn(e,2400,500));
}

function scene6(e, t) {
  // "Plants take in water" — drops rise from roots
  drawBackground();
  drawSunCharacter(sunCX, sunCY, 52, t, 0.5);
  drawRoots(cx, gndY, fadeIn(e,0,600));
  drawSunny(cx, gndY, t, false);

  // 3 water drops rising along stem at staggered intervals
  [0, 500, 1000].forEach((delay, i) => {
    const rise = ease.out(clamp01((e-delay)/2000));
    const dx = cx - 12 + i*12;
    const dy = lerp(gndY+80, gndY-80, rise);
    const da = fadeIn(e, delay, 400);
    drawWaterDrop(dx, dy, 14+i*2, da);
  });

  if(e>1800) drawArrow(cx, gndY-70, 'down', fadeIn(e,1800)*0.7, 'VIA ROOTS');
  if(e>2500) drawSpeechBubble("Water comes up my roots! 💧", cx, gndY-165, fadeIn(e,2500,500));
}

function scene7(e, t) {
  // "Water + CO2 + Energy → Glucose" — combination reaction
  drawBackground();
  drawSunCharacter(sunCX, sunCY, 52, t, 0.5);
  drawSunny(cx, gndY, t, true);

  const phase1 = clamp01(e/1000);
  const phase2 = clamp01((e-1000)/800);
  const phase3 = clamp01((e-1800)/800);

  // Show ingredients converging
  const ingA = Math.min(1, phase1*2);
  // CO2 from right
  const co2x = lerp(cx+160, cx+50, ease.out(phase1));
  drawCO2Bubble(co2x, gndY-130, 20, ingA);
  // Water drop from bottom
  const wdy = lerp(gndY+20, gndY-105, ease.out(phase1));
  drawWaterDrop(cx-50, wdy, 14, ingA);
  // Energy bolt
  drawEnergyBolt(cx-5, gndY-140, 18, ingA*phase2);

  // Plus signs
  if(phase1 > 0.5) {
    ctx.save(); ctx.globalAlpha=phase2; ctx.fillStyle='#1565C0'; ctx.font='bold 22px Segoe UI'; ctx.textAlign='center';
    ctx.fillText('+', cx+10, gndY-110);
    ctx.fillText('+', cx-30, gndY-120);
    ctx.restore();
  }

  // Arrow → glucose
  if(phase2 > 0.3) {
    ctx.save(); ctx.globalAlpha=phase2; ctx.strokeStyle='#1565C0'; ctx.lineWidth=3; ctx.lineCap='round';
    ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(cx+10,gndY-95); ctx.lineTo(cx+90,gndY-95); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#1565C0';
    ctx.beginPath(); ctx.moveTo(cx+85,gndY-102); ctx.lineTo(cx+98,gndY-95); ctx.lineTo(cx+85,gndY-88); ctx.fill();
    ctx.restore();
  }

  // Glucose appears
  if(phase3 > 0) {
    const pulse = 1 + Math.sin(t*0.1)*0.06;
    drawGlucose(cx+135, gndY-95, 32, phase3, pulse);
    if(phase3>0.7) drawArrow(cx+135, gndY-57, 'down', (phase3-0.7)/0.3, 'GLUCOSE!');
  }

  if(e>3000) drawSpeechBubble("I made food! 🎉", cx, gndY-175, fadeIn(e,3000,500));
}

function scene8(e, t) {
  // "Glucose is plant food" — glucose absorbed, plant grows/celebrates
  drawBackground();
  drawSunCharacter(sunCX, sunCY, 52, t, 0.8);

  // Bigger plant (growth effect)
  const growScale = 1 + ease.out(clamp01(e/1500))*0.18;
  drawSunny(cx, gndY, t, true, growScale);

  // Multiple glucose hexagons floating into plant
  const glA = fadeIn(e,0,600);
  [
    [cx+110, gndY-80, 28],
    [cx+90,  gndY-130, 22],
    [cx+130, gndY-115, 18],
  ].forEach(([gx,gy,gr], i) => {
    const travel = ease.out(clamp01((e-i*300)/1800));
    const fx = lerp(gx, cx+5, travel);
    const fy = lerp(gy, gndY-100, travel);
    const fa = glA * (travel < 0.95 ? 1 : fadeOut(e-i*300-1800*0.9, 0, 300));
    drawGlucose(fx, fy, gr, fa, 1+Math.sin(t*0.08+i)*0.05);
  });

  // Sparkles celebration
  if(e>2000) {
    const spA = fadeIn(e,2000,500);
    for(let i=0;i<10;i++){
      const ang=(i/10)*Math.PI*2+t*0.04;
      const sr = 80+i*12;
      ctx.save(); ctx.globalAlpha=spA*0.8;
      ctx.fillStyle=['#FFD700','#FF6B6B','#4CAF50','#29B6F6'][i%4];
      ctx.beginPath(); ctx.arc(cx+Math.cos(ang)*sr, gndY-100+Math.sin(ang)*sr, 4, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  if(e>1000) drawSpeechBubble("Glucose = my food energy! 🍬💪", cx, gndY-185*growScale, fadeIn(e,1000,600));
  if(e>2800) {
    ctx.save(); ctx.globalAlpha=fadeIn(e,2800,600);
    ctx.font='bold 22px Segoe UI'; ctx.textAlign='center'; ctx.fillStyle='#1B5E20';
    ctx.fillText('Photosynthesis complete! 🌿✨', W/2, 40);
    ctx.restore();
  }
}

const SCENE_FNS = [scene1,scene2,scene3,scene4,scene5,scene6,scene7,scene8];

// ─── PROGRESS DOTS ────────────────────────────────────────────────────────────
function drawProgressDots(current) {
  const total=8, r=5, gap=16, startX=W/2-(total-1)*gap/2, y=H-18;
  for(let i=0;i<total;i++){
    ctx.fillStyle = i===current ? '#2563EB' : i<current ? '#93C5FD' : 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.arc(startX+i*gap, y, i===current?r+1:r, 0, Math.PI*2); ctx.fill();
  }
}

// ─── SCENE STRIP ─────────────────────────────────────────────────────────────
function buildStrip() {
  const strip = document.getElementById('sceneStrip');
  SCENES.forEach((s,i) => {
    const div = document.createElement('div');
    div.className='thumb'; div.id=\`thumb-\${i}\`;
    div.innerHTML=\`<div class="thumb-num">\${i+1}</div><div class="thumb-text">\${s.hint}</div>\`;
    div.onclick=()=>{ elapsed=i*SCENE_DURATION; if(!isPlaying) isPlaying=true; updatePlayBtn(); };
    strip.appendChild(div);
  });
}

function updateStrip(idx) {
  SCENES.forEach((_,i) => {
    const t = document.getElementById(\`thumb-\${i}\`);
    if(!t) return;
    t.className = 'thumb' + (i===idx?' active':'') + (i<idx?' done':'');
    const num = t.querySelector('.thumb-num');
    num.textContent = i<idx ? '✓' : String(i+1);
  });
}

// ─── PLAYER LOOP ──────────────────────────────────────────────────────────────
let elapsed  = 0;
let isPlaying= false;
let lastTime = null;
let raf      = null;

function updatePlayBtn() {
  const btn = document.getElementById('btnPlay');
  btn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
}

function loop(ts) {
  raf = requestAnimationFrame(loop);
  if (isPlaying) {
    if (lastTime !== null) {
      const dt = Math.min(ts - lastTime, 50);
      elapsed += dt;
      if (elapsed >= TOTAL_DURATION) { elapsed = 0; isPlaying = false; updatePlayBtn(); }
    }
    lastTime = ts;
  } else {
    lastTime = null;
  }

  const sceneIdx   = Math.min(7, Math.floor(elapsed / SCENE_DURATION));
  const sceneElaps = elapsed % SCENE_DURATION;
  const t          = elapsed * 0.05; // global time for wobble

  // Draw
  SCENE_FNS[sceneIdx](sceneElaps, t);
  drawProgressDots(sceneIdx);

  // UI updates
  document.getElementById('sceneText').textContent = SCENES[sceneIdx].text;
  document.getElementById('sceneCounter').textContent = \`Scene \${sceneIdx+1} / 8\`;
  const pct = (elapsed/TOTAL_DURATION)*100;
  document.getElementById('progressFill').style.width = pct+'%';
  const totalSec = Math.floor(elapsed/1000);
  document.getElementById('timeLabel').textContent =
    \`\${Math.floor(totalSec/60)}:\${String(totalSec%60).padStart(2,'0')} / 0:36\`;
  updateStrip(sceneIdx);
}

document.getElementById('btnPlay').onclick = () => {
  isPlaying = !isPlaying;
  updatePlayBtn();
};
document.getElementById('btnReset').onclick = () => {
  elapsed=0; isPlaying=false; updatePlayBtn();
};
canvas.onclick = () => {
  isPlaying = !isPlaying; updatePlayBtn();
};

buildStrip();
requestAnimationFrame(loop);
</script>
</body>
</html>`;

export default function TestVisualScreen() {
  // WebView does not support web — show a simple notice instead.
  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.webNotice}>
          <Text style={styles.webTitle}>test-visual</Text>
          <Text style={styles.webText}>
            The Sunny canvas demo is available on the native app (iOS / Android)
            only. To inspect the HTML version, open your standalone
            photosynthesis demo file directly in a browser.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: TEST_HTML }}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  webview: {
    flex: 1,
  },
  webNotice: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  webTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 8,
  },
  webText: {
    fontSize: 13,
    color: "#CBD5F5",
    textAlign: "center",
  },
});

