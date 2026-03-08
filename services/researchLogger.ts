type CueType = "HAPTIC" | "AUDIO";

type CueFiredMeta = {
  lessonId?: string;
  sceneId?: string;
  sessionId?: string;
};

export type CueFiredEvent = {
  cueId: string;
  type: CueType;
  scheduledAtMs: number;
  firedAtMs: number;
  meta: CueFiredMeta;
};

export type NasaTlxPayload = {
  lessonId?: string;
  sessionId?: string;
  responses: Record<string, number>;
};

const pendingCueEvents: CueFiredEvent[] = [];
const pendingNasaTlx: NasaTlxPayload[] = [];

export const researchLogger = {
  logCueFired(
    cueId: string,
    type: CueType,
    scheduledAtMs: number,
    firedAtMs: number,
    meta: CueFiredMeta = {},
  ) {
    const event: CueFiredEvent = {
      cueId,
      type,
      scheduledAtMs,
      firedAtMs,
      meta,
    };
    pendingCueEvents.push(event);
    console.log("[researchLogger] cueFired", event);
  },

  logNasaTlx(payload: NasaTlxPayload) {
    pendingNasaTlx.push(payload);
    console.log("[researchLogger] nasaTlx", payload);
  },

  async flushPendingLogs(): Promise<void> {
    if (!pendingCueEvents.length && !pendingNasaTlx.length) return;
    const batch = {
      cues: [...pendingCueEvents],
      nasaTlx: [...pendingNasaTlx],
    };
    pendingCueEvents.length = 0;
    pendingNasaTlx.length = 0;

    // TODO: POST to backend when research API is ready.
    console.log("[researchLogger] flush", batch);
  },
};

