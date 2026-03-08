import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { getStoredToken } from "@/services/api";

// expo-av: use require to avoid TS resolution issues with Audio export
const { Audio } = require("expo-av");

type LoopId = "40hz_gamma" | "spatial_music";
export type SpeechRate = "slow" | "normal" | "fast";

const loops: Record<string, InstanceType<typeof Audio.Sound> | null> = {};
let currentNarrationSound: InstanceType<typeof Audio.Sound> | null = null;
/** On web we use a blob URL; revoke when done. */
let currentNarrationBlobUrl: string | null = null;

/** Encode ArrayBuffer to base64 (works in RN without btoa polyfill). */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    result += CHARS[a >> 2];
    result += CHARS[((a & 3) << 4) | (b ?? 0) >> 4];
    result += b !== undefined ? CHARS[((b & 15) << 2) | (c ?? 0) >> 6] : "=";
    result += c !== undefined ? CHARS[c & 63] : "=";
  }
  return result;
}

export const audioClient = {
  /**
   * Play narration using backend TTS (POST /api/tts/synthesize).
   * Uses cue.text and overlay.speech_rate; plays returned MP3 with expo-av.
   */
  async playNarrationFromBackend(
    text: string,
    speechRate: SpeechRate,
    onDone?: () => void,
  ): Promise<void> {
    if (!text?.trim()) {
      onDone?.();
      return;
    }
    await this.stopNarration();

    const token = await getStoredToken();
    const url = `${API_BASE_URL}${API_ENDPOINTS.TTS_SYNTHESIZE}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: text.trim(), speech_rate: speechRate }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn("[audioClient] TTS synthesize failed", response.status, errText);
        onDone?.();
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      let fileUri: string;

      if (Platform.OS === "web") {
        // Web: no cache directory; use blob URL for playback.
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        const blobUrl = URL.createObjectURL(blob);
        currentNarrationBlobUrl = blobUrl;
        fileUri = blobUrl;
      } else {
        const cacheDir = FileSystem.cacheDirectory;
        if (!cacheDir) throw new Error("No cache directory");
        const base64 = arrayBufferToBase64(arrayBuffer);
        const filename = `tts_${Date.now()}.mp3`;
        fileUri = `${cacheDir}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true },
      );
      currentNarrationSound = sound;

      sound.setOnPlaybackStatusUpdate((status: { isLoaded: boolean; didJustFinish?: boolean; isLooping?: boolean }) => {
        if (
          status.isLoaded &&
          status.didJustFinish &&
          !status.isLooping
        ) {
          sound.unloadAsync().then(() => {
            currentNarrationSound = null;
            if (currentNarrationBlobUrl) {
              URL.revokeObjectURL(currentNarrationBlobUrl);
              currentNarrationBlobUrl = null;
            }
            if (Platform.OS !== "web" && fileUri?.startsWith("file")) {
              try {
                FileSystem.deleteAsync(fileUri, { idempotent: true });
              } catch {}
            }
            onDone?.();
          });
        }
      });
    } catch (err) {
      console.warn("[audioClient] playNarrationFromBackend error", err);
      onDone?.();
    }
  },

  /**
   * Stop and unload current narration (backend TTS). Call on unmount.
   */
  async stopNarration(): Promise<void> {
    if (currentNarrationBlobUrl) {
      URL.revokeObjectURL(currentNarrationBlobUrl);
      currentNarrationBlobUrl = null;
    }
    if (currentNarrationSound) {
      try {
        await currentNarrationSound.stopAsync();
        await currentNarrationSound.unloadAsync();
      } catch (_) {}
      currentNarrationSound = null;
    }
  },

  /**
   * Stop all audio: narration + ambient loops. Used by sensory manager on dispose.
   */
  async stop(): Promise<void> {
    await this.stopNarration();
    await this.stopAllLoops();
  },

  /**
   * @deprecated Use playNarrationFromBackend for narration.
   */
  async playOneShot(_textOrId: string): Promise<void> {
    // No-op; narration goes through playNarrationFromBackend.
  },

  async playLoop(id: LoopId): Promise<void> {
    if (loops[id]) return;
    const sound = new Audio.Sound();
    try {
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
      loops[id] = sound;
    } catch {
      loops[id] = null;
    }
  },

  async stopLoop(id: LoopId): Promise<void> {
    const sound = loops[id];
    if (!sound) return;
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
    } finally {
      loops[id] = null;
    }
  },

  async stopAllLoops(): Promise<void> {
    const ids = Object.keys(loops) as LoopId[];
    for (const id of ids) {
      await this.stopLoop(id);
    }
  },
};
