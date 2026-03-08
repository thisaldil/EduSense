import { apiPost } from "@/services/api";
import type { animationApi } from "@/services/api";
import type {
  BackendSensoryOverlay,
  SensoryOverlay,
} from "@/types/sensory";
import { mapBackendOverlayToSensoryOverlay } from "@/types/sensory";

type NeuroAdaptiveAnimationScript = animationApi.NeuroAdaptiveAnimationScript;

export namespace sensoryClient {
  export interface OverlayRequest {
    script: NeuroAdaptiveAnimationScript;
    cognitive_state: "OVERLOAD" | "OPTIMAL" | "LOW_LOAD";
    concept?: string;
    student_id?: string;
    lesson_id?: string;
    session_id?: string;
  }

  /**
   * POST /api/sensory/overlay
   * Member 3 – builds sensory overlay from a visual script + cognitive state.
   */
  export const getOverlay = async (
    body: OverlayRequest,
  ): Promise<SensoryOverlay> => {
    const raw = await apiPost<BackendSensoryOverlay>(
      "/api/sensory/overlay",
      body,
    );
    return mapBackendOverlayToSensoryOverlay(raw, body.script);
  };
}

