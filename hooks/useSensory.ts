import { useEffect, useRef } from "react";
import type { animationApi } from "@/services/api";
import type { SensoryOverlay } from "@/types/sensory";
import { sensoryClient } from "@/services/sensoryClient";
import { sensoryManager } from "@/services/sensoryManager";
import { useSensoryStore } from "@/store/sensoryStore";

type NeuroAdaptiveAnimationScript = animationApi.NeuroAdaptiveAnimationScript;

export type UseSensoryParams = {
  lessonId: string;
  studentId?: string;
  sessionId?: string;
  script: NeuroAdaptiveAnimationScript | null;
  cognitiveState: string;
  animationClock: { currentTimeMs: number; isPlaying: boolean };
};

export function useSensory({
  lessonId,
  studentId,
  sessionId,
  script,
  cognitiveState,
  animationClock,
}: UseSensoryParams) {
  const overlayRef = useRef<SensoryOverlay | undefined>(undefined);
  const currentState = useSensoryStore((s) => s.cognitiveState);

  // Keep cognitive state in store in sync with Member 1
  useEffect(() => {
    if (currentState !== cognitiveState) {
      useSensoryStore.getState().setCognitiveState(cognitiveState);
    }
  }, [cognitiveState, currentState]);

  // Fetch overlay when script or cognitive state changes
  useEffect(() => {
    const fetchOverlay = async () => {
      if (!script) {
        overlayRef.current = undefined;
        sensoryManager.setOverlay(undefined);
        useSensoryStore.getState().setOverlay(undefined);
        return;
      }

      try {
        const overlay = await sensoryClient.getOverlay({
          script,
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

    fetchOverlay();
  }, [script, cognitiveState, lessonId, studentId, sessionId]);

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
    if (!animationClock.isPlaying) return;
    sensoryManager.onTick(animationClock.currentTimeMs);
  }, [animationClock.currentTimeMs, animationClock.isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sensoryManager.dispose();
    };
  }, []);
}

