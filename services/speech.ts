/**
 * TTS service using Expo Speech.
 * Narration text comes from overlay.narration[].text; rate from overlay.speech_rate.
 */
import * as Speech from "expo-speech";

export type SpeechRatePreset = "slow" | "normal" | "fast";

const RATE_MAP: Record<SpeechRatePreset, number> = {
  slow: 0.5,
  normal: 0.75,
  fast: 1.0,
};

export const speechService = {
  /**
   * Speak text using TTS. Use cue.text from overlay.narration and overlay.speech_rate.
   */
  speak(
    text: string,
    options?: {
      speechRate?: SpeechRatePreset;
      onDone?: () => void;
    },
  ): void {
    if (!text?.trim()) return;
    const rate = options?.speechRate
      ? RATE_MAP[options.speechRate]
      : RATE_MAP.normal;
    Speech.speak(text.trim(), {
      rate,
      onDone: options?.onDone,
    });
  },

  stop(): void {
    Speech.stop();
  },

  /** Returns whether TTS is currently speaking (async). */
  async isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  },
};
