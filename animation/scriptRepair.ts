/**
 * Shared playback fixes for LLM/backend-generated animation scripts.
 * Used by scriptNormalizer (web) and runtime normalizeScript; RN WebView applies via AnimationCanvasWebView.
 */

const DEFAULT_W = 800;
const DEFAULT_H = 600;
const MARGIN = 42;

function n(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function hasXY(a: {
  x?: number | null;
  y?: number | null;
}): a is { x: number; y: number } {
  return Number.isFinite(a.x) && Number.isFinite(a.y);
}

/** Sun / star / sun_character share one sky slot; keep first only. */
export const SUN_VARIANTS = new Set(["sun", "sun_character", "star"]);

/** One canonical plant slot (foliage variants). */
export const PLANT_VARIANTS = new Set([
  "plant",
  "plant_character",
  "leaf",
  "tree",
]);

/** Prefer at most one sun-like and at most one plant-like actor per scene. */
export function dedupeSunAndStar<T extends { type: string }>(actors: T[]): T[] {
  let hasSun = false;
  let hasPlant = false;
  return actors.filter((a) => {
    if (SUN_VARIANTS.has(a.type)) {
      if (hasSun) return false;
      hasSun = true;
      return true;
    }
    if (PLANT_VARIANTS.has(a.type)) {
      if (hasPlant) return false;
      hasPlant = true;
      return true;
    }
    return true;
  });
}

export function dropRedundantGlucoseLabels<
  T extends { type: string; x?: number | null; y?: number | null; text?: string },
>(actors: T[]): T[] {
  const glucoses = actors.filter((a) => a.type === "glucose" && hasXY(a));
  if (!glucoses.length) return actors;

  const compactFormula = (s: string) =>
    s
      .trim()
      .replace(/\s/g, "")
      .replace(/₁/g, "1")
      .replace(/₂/g, "2")
      .replace(/₃/g, "3")
      .replace(/₄/g, "4")
      .replace(/₅/g, "5")
      .replace(/₆/g, "6")
      .replace(/₁₂/g, "12")
      .toLowerCase();

  const isGlucoseLabelText = (text: string) => {
    const c = compactFormula(text);
    return (
      /^c6h12o6$/i.test(c) ||
      /^c₆h₁₂o₆$/i.test(text.trim().replace(/\s/g, "")) ||
      /^glucose$/i.test(text.trim())
    );
  };

  return actors.filter((a) => {
    if (a.type !== "label" || !hasXY(a)) return true;
    if (!isGlucoseLabelText(a.text || "")) return true;
    return !(glucoses as { x: number; y: number }[]).some(
      (g) => dist(a.x!, a.y!, g.x, g.y) < 56,
    );
  });
}

export function staggerCoincidentActors<
  T extends { type: string; x?: number | null; y?: number | null },
>(actors: T[], canvasW = DEFAULT_W, canvasH = DEFAULT_H): void {
  const buckets = new Map<string, T[]>();
  for (const a of actors) {
    if (!hasXY(a)) continue;
    const key = `${Math.round(a.x)}_${Math.round(a.y)}_${a.type}`;
    const arr = buckets.get(key);
    if (arr) arr.push(a);
    else buckets.set(key, [a]);
  }
  for (const group of buckets.values()) {
    if (group.length < 2) continue;
    for (let i = 1; i < group.length; i++) {
      const a = group[i];
      a.x = clamp(a.x! + 34 * i, MARGIN, canvasW - MARGIN);
      a.y = clamp(
        a.y! + (i % 2 === 0 ? 22 : -18) * i,
        MARGIN,
        canvasH - MARGIN,
      );
    }
  }
}

export function separatePlantAndGlucose<
  T extends { type: string; x?: number | null; y?: number | null },
>(actors: T[], canvasW = DEFAULT_W, canvasH = DEFAULT_H): void {
  const plants = actors.filter(
    (a) => PLANT_VARIANTS.has(a.type) && hasXY(a),
  ) as { x: number; y: number; type: string }[];
  const glucoses = actors.filter((a) => a.type === "glucose" && hasXY(a));
  for (const g of glucoses) {
    if (!hasXY(g)) continue;
    for (const p of plants) {
      if (dist(g.x!, g.y!, p.x, p.y) < 78) {
        g.x = clamp(p.x + 230, MARGIN, canvasW - MARGIN);
        g.y = clamp(p.y - 45, MARGIN, canvasH - MARGIN);
      }
    }
  }
}

export function clampSunInCanvas<
  T extends { type: string; x?: number | null; y?: number | null },
>(actors: T[], canvasW = DEFAULT_W): void {
  for (const a of actors) {
    if (!SUN_VARIANTS.has(a.type) || !hasXY(a)) continue;
    a.x = clamp(a.x!, MARGIN, canvasW - 92);
    a.y = clamp(a.y!, 38, 118);
  }
}

export function clampRootsInCanvas<
  T extends { type: string; x?: number | null; y?: number | null; depth?: unknown },
>(actors: T[], canvasH = DEFAULT_H): void {
  for (const a of actors) {
    if (a.type !== "root" || !hasXY(a)) continue;
    const depth = n(a.depth, 58);
    a.y = Math.min(a.y!, canvasH - MARGIN - depth);
  }
}

export function clampArrowsInCanvas<
  T extends {
    type: string;
    x?: number | null;
    y?: number | null;
    length?: number | null;
    angle?: number | null;
  },
>(actors: T[], canvasW = DEFAULT_W, canvasH = DEFAULT_H): void {
  for (const a of actors) {
    if (a.type !== "arrow" || !hasXY(a)) continue;
    let x = clamp(a.x!, MARGIN, canvasW - MARGIN);
    let y = clamp(a.y!, MARGIN, canvasH - MARGIN);
    let length = Math.max(28, n(a.length, 120));
    const angle = n(a.angle, 0);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    for (let iter = 0; iter < 48; iter++) {
      const tipX = x + cos * length;
      const tipY = y + sin * length;
      if (
        tipX >= MARGIN &&
        tipX <= canvasW - MARGIN &&
        tipY >= MARGIN &&
        tipY <= canvasH - MARGIN
      ) {
        break;
      }
      length *= 0.91;
    }

    let tipX = x + cos * length;
    let tipY = y + sin * length;
    if (tipX > canvasW - MARGIN) x -= tipX - (canvasW - MARGIN);
    if (tipX < MARGIN) x += MARGIN - tipX;
    if (tipY > canvasH - MARGIN) y -= tipY - (canvasH - MARGIN);
    if (tipY < MARGIN) y += MARGIN - tipY;
    x = clamp(x, MARGIN, canvasW - MARGIN);
    y = clamp(y, MARGIN, canvasH - MARGIN);

    for (let iter = 0; iter < 20; iter++) {
      tipX = x + cos * length;
      tipY = y + sin * length;
      if (
        tipX >= MARGIN &&
        tipX <= canvasW - MARGIN &&
        tipY >= MARGIN &&
        tipY <= canvasH - MARGIN
      ) {
        break;
      }
      length *= 0.9;
    }

    a.x = x;
    a.y = y;
    a.length = Math.max(28, length);
  }
}

export function fillEmptyLabelText<
  T extends { type: string; text?: string },
>(actors: T[], sceneText: string): void {
  const sentences = sceneText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  let si = 0;
  for (const a of actors) {
    if (a.type !== "label") continue;
    if ((a.text || "").trim()) continue;
    a.text =
      sentences[si] ||
      sentences[0] ||
      sceneText.trim().slice(0, 44) ||
      "Concept";
    si++;
  }
}

export function ensureActorFadeTimelines<
  T extends { timeline?: { at: number; action?: string; alpha?: number }[] },
>(actors: T[]): void {
  actors.forEach((a, idx) => {
    const tl = Array.isArray(a.timeline) ? a.timeline : [];
    if (tl.length > 0) return;
    const stagger = Math.min(idx * 100, 2200);
    a.timeline = [
      { at: stagger, action: "appear", alpha: 0 },
      { at: stagger + 480, action: "appear", alpha: 1 },
    ];
  });
}

export function repairSceneActors<T extends Record<string, unknown>>(
  actors: T[],
  sceneDuration: number,
  sceneText: string,
  canvasW = DEFAULT_W,
  canvasH = DEFAULT_H,
): { actors: T[]; duration: number } {
  let list = dedupeSunAndStar(actors);
  list = dropRedundantGlucoseLabels(list as any) as T[];
  staggerCoincidentActors(list as any, canvasW, canvasH);
  separatePlantAndGlucose(list as any, canvasW, canvasH);
  clampSunInCanvas(list as any, canvasW);
  clampRootsInCanvas(list as any, canvasH);
  clampArrowsInCanvas(list as any, canvasW, canvasH);
  fillEmptyLabelText(list as any, sceneText);
  ensureActorFadeTimelines(list as any);

  let duration = sceneDuration;
  if (list.length >= 9 && duration <= 8000) {
    duration = 10000;
  }
  return { actors: list, duration };
}
