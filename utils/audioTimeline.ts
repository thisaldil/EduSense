/**
 * Wall-clock lesson audio timeline helpers (GET neuro-adaptive/latest + session fields).
 * Independent of scene index — narration/TTS keys use lessonId + at + text + speech_rate.
 */
import type { SpeechRate } from "@/services/audioClient";

export function normalizeTextForTtsKey(text: string): string {
  return String(text).trim().replace(/\s+/g, " ");
}

/** Stable id for prefetch + sensory narration cues when using API audio_timeline. */
export function buildTtsCueId(
  lessonId: string,
  atMs: number,
  text: string,
  speechRate: string,
): string {
  const nt = normalizeTextForTtsKey(text);
  return `tts:${lessonId}:${atMs}:${nt}:${speechRate}`;
}

/**
 * Find row index where lessonElapsedMs ∈ [at, at + duration).
 * If duration is 0, uses a 1ms window so the interval is non-empty.
 */
/** Same interval rule as audio_timeline rows, using narration cues from SensoryOverlay. */
export function activeNarrationCue<T extends { atMs: number; durationMs: number }>(
  lessonElapsedMs: number,
  narration: T[],
): T | null {
  if (!narration.length) return null;
  for (let i = 0; i < narration.length; i++) {
    const { atMs, durationMs } = narration[i];
    const end = atMs + (durationMs > 0 ? durationMs : 1);
    if (lessonElapsedMs >= atMs && lessonElapsedMs < end) return narration[i];
  }
  return null;
}

export function activeAudioTimelineIndex(
  lessonElapsedMs: number,
  timeline: { at: number; duration: number }[],
): number | null {
  if (!timeline.length) return null;
  for (let i = 0; i < timeline.length; i++) {
    const { at, duration } = timeline[i];
    const end = at + (duration > 0 ? duration : 1);
    if (lessonElapsedMs >= at && lessonElapsedMs < end) return i;
  }
  return null;
}

export function normalizeSpeechRateLoose(v: unknown): SpeechRate {
  if (v === "slow" || v === "normal" || v === "fast") return v;
  return "normal";
}
