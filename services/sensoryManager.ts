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

  setOverlay(overlay: SensoryOverlay | undefined) {
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

    // AUDIO (narration TTS)
    if (audioEnabled) {
      const dueNarration = overlay.narration.filter(
        (cue) =>
          cue.atMs <= currentTimeMs && !this.firedNarration.has(cue.id),
      );
      for (const cue of dueNarration) {
        this.firedNarration.add(cue.id);
        setLastCue({
          id: cue.id,
          type: "AUDIO",
          timeMs: currentTimeMs,
          patternOrText: cue.text,
        });
        this.logCue("AUDIO", cue, currentTimeMs, sessionId);
        this.fireNarration(cue);
      }
    }
  }

  async dispose() {
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

  private fireNarration(cue: NarrationCue) {
    const overlay = this.overlay;
    if (!overlay) return;
    try {
      const cached = getPrefetchedNarrationUri(cue.id);
      if (cached) {
        audioClient.playNarrationFromUri(cached, undefined);
      } else {
        audioClient.playNarrationFromBackend(
          cue.text,
          overlay.speechRate,
          undefined,
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

