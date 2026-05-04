import { HAPTIC_PATTERNS } from "@/constants/hapticPatterns";
import { audioClient } from "@/services/audioClient";
import { getPrefetchedNarrationUri } from "@/services/narrationAudio";
import { researchLogger } from "@/services/researchLogger";
import { useSensoryStore } from "@/store/sensoryStore";
import type {
  SensoryOverlay,
  HapticCue,
  NarrationCue,
} from "@/types/sensory";

type SessionContext = {
  lessonId?: string;
  studentId?: string;
  sessionId?: string;
};

export class SensoryManager {
  private overlay?: SensoryOverlay;
  private session: SessionContext = {};
  private firedHaptics = new Set<string>();
  private firedNarration = new Set<string>();
  /** Cues reserved for the serial narration queue (avoid duplicate scheduling before playback starts). */
  private narrationReserved = new Set<string>();
  /** One narration clip at a time; next starts when the previous await completes. */
  private narrationTail: Promise<void> = Promise.resolve();
  private narrationPipelineGen = 0;

  setOverlay(overlay: SensoryOverlay | undefined) {
    void audioClient.stopNarration();
    this.bumpNarrationPipeline();
    this.narrationReserved.clear();
    this.overlay = overlay;
    this.firedHaptics.clear();
    this.firedNarration.clear();
    useSensoryStore.getState().setOverlay(overlay);
    this.handleAmbient();
  }

  setPreferences({
    hapticsEnabled,
    audioEnabled,
  }: {
    hapticsEnabled: boolean;
    audioEnabled: boolean;
  }) {
    useSensoryStore.setState({
      hapticsEnabled,
      audioEnabled,
    });
  }

  setSessionContext(ctx: SessionContext) {
    this.session = ctx;
    useSensoryStore.getState().setSessionId(ctx.sessionId);
  }

  /**
   * Call when animation pauses, timeline scrubs to background, or similar — cancels queued clips
   * and stops playback without leaking audio.
   */
  onAnimationPaused(): void {
    this.bumpNarrationPipeline();
    this.narrationReserved.clear();
    void audioClient.stopNarration();
  }

  /**
   * Screen blur / navigation away: stop narration and drop pending queue (fired ids unchanged).
   */
  onScreenBlurred(): void {
    this.onAnimationPaused();
  }

  private bumpNarrationPipeline(): void {
    this.narrationPipelineGen++;
    this.narrationTail = Promise.resolve();
  }

  async onTick(currentTimeMs: number) {
    const overlay = this.overlay;
    if (!overlay) return;

    const {
      hapticsEnabled,
      audioEnabled,
      setLastCue,
      sessionId,
    } = useSensoryStore.getState();

    // HAPTICS
    if (hapticsEnabled) {
      const dueHaptics = overlay.haptics.filter(
        (cue) =>
          cue.atMs <= currentTimeMs && !this.firedHaptics.has(cue.id),
      );
      for (const cue of dueHaptics) {
        this.firedHaptics.add(cue.id);
        setLastCue({
          id: cue.id,
          type: "HAPTIC",
          timeMs: currentTimeMs,
          patternOrText: cue.pattern,
        });
        this.logCue("HAPTIC", cue, currentTimeMs, sessionId);
        await this.fireHaptic(cue);
      }
    }

    // AUDIO (narration) — serial queue: never overlap two clips
    if (audioEnabled) {
      const dueNarration = overlay.narration
        .filter(
          (cue) =>
            cue.atMs <= currentTimeMs &&
            !this.firedNarration.has(cue.id) &&
            !this.narrationReserved.has(cue.id),
        )
        .sort((a, b) => a.atMs - b.atMs || a.id.localeCompare(b.id));

      for (const cue of dueNarration) {
        this.narrationReserved.add(cue.id);
        const pipeGen = this.narrationPipelineGen;
        this.narrationTail = this.narrationTail.then(() =>
          this.playNarrationCueSerial(cue, pipeGen, currentTimeMs, sessionId),
        );
      }
    }
  }

  async dispose() {
    this.bumpNarrationPipeline();
    this.narrationReserved.clear();
    await audioClient.stop();
    this.firedNarration.clear();
    this.firedHaptics.clear();
    useSensoryStore.getState().setOverlay(undefined);
    useSensoryStore.getState().setLastCue(undefined);
  }

  private async handleAmbient() {
    const overlay = this.overlay;
    if (!overlay) {
      await audioClient.stopAllLoops();
      return;
    }
    await audioClient.stopAllLoops();
    if (overlay.ambientMode === "silence") return;
    if (
      overlay.ambientMode === "40hz_gamma" ||
      overlay.ambientMode === "spatial_music"
    ) {
      await audioClient.playLoop(overlay.ambientMode);
    }
  }

  private async fireHaptic(cue: HapticCue) {
    const patternFn =
      HAPTIC_PATTERNS[cue.pattern as keyof typeof HAPTIC_PATTERNS];
    if (!patternFn) return;
    try {
      await patternFn();
    } catch (err) {
      console.warn("[SensoryManager] haptic error", err);
    }
  }

  private async playNarrationCueSerial(
    cue: NarrationCue,
    pipeGen: number,
    currentTimeMs: number,
    sessionId?: string,
  ): Promise<void> {
    if (pipeGen !== this.narrationPipelineGen) {
      this.narrationReserved.delete(cue.id);
      return;
    }

    this.narrationReserved.delete(cue.id);

    const overlay = this.overlay;
    if (!overlay) return;

    if (this.firedNarration.has(cue.id)) return;
    this.firedNarration.add(cue.id);

    const { setLastCue } = useSensoryStore.getState();
    setLastCue({
      id: cue.id,
      type: "AUDIO",
      timeMs: currentTimeMs,
      patternOrText: cue.text,
    });
    this.logCue("AUDIO", cue, currentTimeMs, sessionId);

    const cached = getPrefetchedNarrationUri(cue.id);
    try {
      if (cached) {
        await audioClient.playNarrationFromUri(cached);
      } else {
        await audioClient.playNarrationFromBackend(
          cue.text,
          overlay.speechRate,
        );
      }
    } catch (err) {
      console.warn("[SensoryManager] narration error", err);
    }
  }

  private logCue(
    type: "HAPTIC" | "AUDIO",
    cue: HapticCue | NarrationCue,
    firedAtMs: number,
    sessionId?: string,
  ) {
    const scheduledAtMs = cue.atMs;
    researchLogger.logCueFired(
      cue.id,
      type,
      scheduledAtMs,
      firedAtMs,
      {
        lessonId: this.session.lessonId,
        sceneId: "sceneId" in cue ? (cue as HapticCue).sceneId : undefined,
        sessionId: sessionId ?? this.session.sessionId,
      },
    );
  }
}

export const sensoryManager = new SensoryManager();
