import type { SceneEnvironment } from "./types";

type Ctx = any;

export function drawSceneEnvironment(
  ctx: Ctx,
  W: number,
  H: number,
  environment: SceneEnvironment,
) {
  if (environment === "classroom") {
    ctx.fillStyle = "#E2E8F0";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#CBD5E1";
    ctx.fillRect(0, H * 0.72, W, H * 0.28);
    ctx.fillStyle = "#334155";
    ctx.fillRect(40, 40, 220, 120);
    return;
  }
  if (environment === "nature") {
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.68);
    g.addColorStop(0, "#7DD3FC");
    g.addColorStop(1, "#BAE6FD");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H * 0.68);
    ctx.fillStyle = "#84CC16";
    ctx.fillRect(0, H * 0.68, W, H * 0.32);
    return;
  }
  if (environment === "science") {
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(148,163,184,0.16)";
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    return;
  }

  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#E2E8F0";
  ctx.fillRect(0, H * 0.8, W, H * 0.2);
}

export function drawSlideLabel(ctx: Ctx, text: string, W: number, H: number) {
  const fontSize = 24;
  const width = Math.min(700, Math.max(260, text.length * fontSize * 0.6));
  const height = 60;
  const x = W / 2 - width / 2;
  const y = H / 2 - height / 2;

  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.strokeStyle = "rgba(15,23,42,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, 12);
  } else {
    ctx.rect(x, y, width, height);
  }
  ctx.fill();
  ctx.stroke();

  if (typeof ctx.fillText === "function") {
    ctx.fillStyle = "#0F172A";
    ctx.font = `700 ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text || "Key Idea", W / 2, H / 2);
  }
}
