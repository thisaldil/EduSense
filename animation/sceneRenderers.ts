/**
 * sceneRenderers.ts — Orchestrator only.
 * Domain detection, backgrounds, anchors, and keyword fallbacks live in
 * core/domainDetector.ts, domains/*.ts, and core/shapes.ts + actorRenderers.ts.
 *
 * For photosynthesis domain, scene choreography (light beams, CO₂ drift, water rise,
 * speech bubbles) runs when the scene has actors — see choreographers/.
 */

import { renderActors } from "./actorRenderers";
import {
  hasChoreography,
  shouldSkipAnchors,
  drawPhotosynthesisChoreographyUnder,
  drawPhotosynthesisChoreographyOver,
} from "./choreographers/photosynthesisChoreographer";
import {
  type ConceptDomain,
  detectDomain as detectDomainFromCore,
  DOMAIN_PLUGINS,
} from "./core/domainDetector";
import { drawSceneEnvironment, drawSlideLabel } from "./runtime";

export type Ctx2D = CanvasRenderingContext2D;
export type { ConceptDomain };

type Ctx = any;

export function detectDomain(title: string, scenes: any[]): ConceptDomain {
  return detectDomainFromCore(title, scenes);
}

/**
 * Universal scene renderer: background → [choreography under] → anchors or actors →
 * [choreography over] → keyword fallback (if no visual actors).
 *
 * For photosynthesis with actors: choreography runs, anchors are skipped to avoid
 * duplicating plant/sun.
 */
export function renderUniversalScene(
  scene: any,
  domain: ConceptDomain,
  ctx: Ctx,
  W: number,
  H: number,
  elapsed: number,
): void {
  const t = elapsed * 0.05;
  const plugin = DOMAIN_PLUGINS[domain] ?? DOMAIN_PLUGINS.generic;

  const env = String(scene?.environment || "minimal")
    .toLowerCase()
    .trim();
  if (
    env === "minimal" ||
    env === "classroom" ||
    env === "nature" ||
    env === "science"
  ) {
    drawSceneEnvironment(ctx, W, H, env as any);
  } else {
    plugin.drawBackground(ctx, W, H);
  }

  const useChoreography =
    domain === "photosynthesis" ||
    domain === "nutrition_autotrophic";

  if (useChoreography && hasChoreography(scene)) {
    drawPhotosynthesisChoreographyUnder(scene, ctx, W, H, elapsed);
  }
  if (!(useChoreography && shouldSkipAnchors(scene))) {
    plugin.drawAnchorCharacters(ctx, W, H, t);
  }

  const visualActors = renderActors(scene.actors || [], ctx, elapsed, W, H);

  if (useChoreography && hasChoreography(scene)) {
    drawPhotosynthesisChoreographyOver(scene, ctx, W, H, elapsed);
  }

  if (visualActors === 0 && !hasChoreography(scene)) {
    if (scene.text) {
      drawSlideLabel(ctx, scene.text, W, H);
    } else {
      plugin.keywordFallback(ctx, scene.text || "", elapsed, t, W, H);
    }
  }

  (ctx as any).endFrameEXP?.();
}
