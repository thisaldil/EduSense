import { useEffect, useRef } from "react";
import type { animationApi } from "@/services/api";
import {
  enrichedScriptToSensoryOverlay,
  type EnrichedAnimationScript,
  type SensoryOverlay,
} from "@/types/sensory";
import { sensoryClient } from "@/services/sensoryClient";
import { sensoryManager } from "@/services/sensoryManager";
import { useSensoryStore } from "@/store/sensoryStore";

type NeuroAdaptiveAnimationScript = animationApi.NeuroAdaptiveAnimationScript;

export type UseSensoryParams = {
  lessonId: string;
  studentId?: string;
  sessionId?: string;
  script: NeuroAdaptiveAnimationScript | EnrichedAnimationScript | null;
  cognitiveState: string;
  animationClock: { currentTimeMs: number; isPlaying: boolean };
  /**
   * When set (e.g. GET neuro-adaptive/latest returned audio_timeline), skip enrich-script /
   * GET sensory overlay and drive narration/haptics from this wall-clock overlay only.
   */
  sessionSensoryOverlay?: SensoryOverlay;
};

export function useSensory({
  lessonId,
  studentId,
  sessionId,
  script,
  cognitiveState,
  animationClock,
  sessionSensoryOverlay,
}: UseSensoryParams) {
  const overlayRef = useRef<SensoryOverlay | undefined>(undefined);
  const currentState = useSensoryStore((s) => s.cognitiveState);

  // Keep cognitive state in store in sync with Member 1
  useEffect(() => {
    if (currentState !== cognitiveState) {
      useSensoryStore.getState().setCognitiveState(cognitiveState);
    }
  }, [cognitiveState, currentState]);

  // Fetch overlay when script or cognitive state changes.
  // Prefer enriched script (POST /api/sensory/enrich-script response): build overlay from scene.audio and scene.haptics.
  // Fallback: if script has no sensory, try legacy GET overlay for backward compat; otherwise no sensory.
  useEffect(() => {
    const applyOverlay = async () => {
      if (sessionSensoryOverlay) {
        overlayRef.current = sessionSensoryOverlay;
        sensoryManager.setOverlay(sessionSensoryOverlay);
        return;
      }

      if (!script) {
        overlayRef.current = undefined;
        sensoryManager.setOverlay(undefined);
        useSensoryStore.getState().setOverlay(undefined);
        return;
      }

      const enriched = script as EnrichedAnimationScript;
      if (enriched.sensory) {
        const overlay = enrichedScriptToSensoryOverlay(enriched);
        if (overlay) {
          overlayRef.current = overlay;
          sensoryManager.setOverlay(overlay);
          return;
        }
      }

      try {
        const overlay = await sensoryClient.getOverlay({
          script: script as NeuroAdaptiveAnimationScript,
          cognitive_state: cognitiveState as
            | "OVERLOAD"
            | "OPTIMAL"
            | "LOW_LOAD",
          concept: script.title,
          student_id: studentId,
          lesson_id: lessonId,
          session_id: sessionId,
        });
        overlayRef.current = overlay;
        sensoryManager.setOverlay(overlay);
      } catch (err) {
        console.warn("[useSensory] overlay fetch failed", err);
        overlayRef.current = undefined;
        sensoryManager.setOverlay(undefined);
      }
    };

    applyOverlay();
  }, [
    sessionSensoryOverlay,
    script,
    cognitiveState,
    lessonId,
    studentId,
    sessionId,
  ]);

  // Attach session context
  useEffect(() => {
    sensoryManager.setSessionContext({
      lessonId,
      studentId,
      sessionId,
    });
  }, [lessonId, studentId, sessionId]);

  // Drive manager from the animation clock
  useEffect(() => {
    if (!animationClock.isPlaying) {
      sensoryManager.onAnimationPaused();
      return;
    }
    void sensoryManager.onTick(animationClock.currentTimeMs);
  }, [animationClock.currentTimeMs, animationClock.isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sensoryManager.dispose();
    };
  }, []);
}

