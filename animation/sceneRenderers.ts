/**
 * sceneRenderers.ts — Orchestrator only.
 * Domain detection, backgrounds, anchors, and keyword fallbacks live in
 * core/domainDetector.ts, domains/*.ts, and core/shapes.ts + actorRenderers.ts.
 */

import { renderActors } from "./actorRenderers";
import {
  type ConceptDomain,
  detectDomain as detectDomainFromCore,
  DOMAIN_PLUGINS,
} from "./core/domainDetector";

export type Ctx2D = CanvasRenderingContext2D;
export type { ConceptDomain };

type Ctx = any;

export function detectDomain(title: string, scenes: any[]): ConceptDomain {
  return detectDomainFromCore(title, scenes);
}

/**
 * Universal scene renderer: background → anchors → actors → keyword fallback (if no visual actors).
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

  plugin.drawBackground(ctx, W, H);
  plugin.drawAnchorCharacters(ctx, W, H, t);

  const visualActors = renderActors(scene.actors || [], ctx, elapsed, W, H);

  if (visualActors === 0) {
    plugin.keywordFallback(ctx, scene.text || "", elapsed, t, W, H);
  }

  (ctx as any).endFrameEXP?.();
}
