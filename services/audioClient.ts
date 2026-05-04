import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { getStoredToken } from "@/services/api";
import { useSensoryStore } from "@/store/sensoryStore";

// expo-av: use require to avoid TS resolution issues with Audio export
const { Audio } = require("expo-av");

type LoopId = "40hz_gamma" | "spatial_music";
export type SpeechRate = "slow" | "normal" | "fast";

export type NarrationPlayResult = {
  ok: boolean;
  /** User-visible message for HTTP errors and load failures */
  error?: string;
};

const loops: Record<string, InstanceType<typeof Audio.Sound> | null> = {};
let currentNarrationSound: InstanceType<typeof Audio.Sound> | null = null;
/** On web we use a blob URL for the active sound (prefetch blobs are not revoked here). */
let currentNarrationBlobUrl: string | null = null;
/** If false, blob URL is owned by narration prefetch cache — do not revoke on stop/finish. */
let narrationBlobDisposable = true;
/**
 * Native temp file written from POST /tts/synthesize bytes; deleted on stop / after playback.
 */
let disposableNarrationFileUri: string | null = null;
/**
 * When stopNarration() preempts playNarration*, callers awaiting playback must resolve.
 */
let settleNarrationPlay: ((r: NarrationPlayResult) => void) | null = null;

let narrationGeneration = 0;
let activeNarrationFetch: AbortController | null = null;

function bumpNarrationGeneration(): void {
  narrationGeneration++;
}

function abortNarrationFetch(): void {
  try {
    activeNarrationFetch?.abort();
  } catch {
    /* ignore */
  }
  activeNarrationFetch = null;
}

/** RIFF…WAVE — detect WAV regardless of mis-set Content-Type. */
function isWavBytes(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 12) return false;
  const u = new Uint8Array(buffer, 0, 12);
  return (
    u[0] === 0x52 &&
    u[1] === 0x49 &&
    u[2] === 0x46 &&
    u[3] === 0x46 &&
    u[8] === 0x57 &&
    u[9] === 0x41 &&
    u[10] === 0x56 &&
    u[11] === 0x45
  );
}

function playbackMimeType(response: Response, buffer: ArrayBuffer): string {
  if (isWavBytes(buffer)) return "audio/wav";
  const ct = response.headers
    .get("Content-Type")
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();
  if (ct?.includes("wav") || ct === "audio/x-wav" || ct === "audio/wave") {
    return "audio/wav";
  }
  if (ct?.includes("mpeg") || ct?.includes("mp3")) return "audio/mpeg";
  return "audio/mpeg";
}

function extensionForMime(mime: string): string {
  return mime === "audio/wav" ? "wav" : "mp3";
}

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

async function deleteDisposableNarrationFile(): Promise<void> {
  const uri = disposableNarrationFileUri;
  disposableNarrationFileUri = null;
  if (!uri || Platform.OS === "web" || !uri.startsWith("file")) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    /* ignore */
  }
}

function publishNarrationError(message: string | null): void {
  try {
    useSensoryStore.getState().setNarrationPlaybackError(message);
  } catch {
    /* store may be unavailable in tests */
  }
}

function isAbortError(e: unknown): boolean {
  return (
    (e instanceof Error && e.name === "AbortError") ||
    (typeof e === "object" &&
      e !== null &&
      (e as { name?: string }).name === "AbortError")
  );
}

export const audioClient = {
  /**
   * Play narration using backend TTS only (POST /api/tts/synthesize).
   * Waits until playback finishes, fails, or stopNarration() preempts (returns ok: false).
   */
  async playNarrationFromBackend(
    text: string,
    speechRate: SpeechRate,
    onDone?: () => void,
    onError?: (message: string) => void,
  ): Promise<NarrationPlayResult> {
    if (!text?.trim()) {
      onDone?.();
      return { ok: true };
    }

    await this.stopNarration();
    publishNarrationError(null);

    const myGen = narrationGeneration;
    const ac = new AbortController();
    activeNarrationFetch = ac;

    const token = await getStoredToken();
    const url = `${API_BASE_URL}${API_ENDPOINTS.TTS_SYNTHESIZE}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const finishPlayback = async (
      sound: InstanceType<typeof Audio.Sound>,
      fileUriForCleanup: string | null,
    ): Promise<NarrationPlayResult> => {
      return await new Promise<NarrationPlayResult>((resolve) => {
        let settled = false;
        const finish = (r: NarrationPlayResult) => {
          if (settled) return;
          settled = true;
          settleNarrationPlay = null;
          if (r.ok) onDone?.();
          resolve(r);
        };

        settleNarrationPlay = finish;

        sound.setOnPlaybackStatusUpdate(
          (status: {
            isLoaded: boolean;
            didJustFinish?: boolean;
            isLooping?: boolean;
          }) => {
            if (settled) return;
            if (
              !status.isLoaded ||
              !status.didJustFinish ||
              status.isLooping
            ) {
              return;
            }
            void sound.unloadAsync().then(() => {
              if (settled) return;
              if (currentNarrationSound === sound) {
                currentNarrationSound = null;
              }
              if (currentNarrationBlobUrl && narrationBlobDisposable) {
                try {
                  URL.revokeObjectURL(currentNarrationBlobUrl);
                } catch {
                  /* ignore */
                }
              }
              currentNarrationBlobUrl = null;
              narrationBlobDisposable = true;

              const path = fileUriForCleanup;
              if (Platform.OS !== "web" && path?.startsWith("file")) {
                FileSystem.deleteAsync(path, { idempotent: true }).catch(
                  () => {},
                );
              }
              if (disposableNarrationFileUri === path) {
                disposableNarrationFileUri = null;
              }
              finish({ ok: true });
            });
          },
        );
      });
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: text.trim(), speech_rate: speechRate }),
        signal: ac.signal,
      });
    } catch (e) {
      if (activeNarrationFetch === ac) activeNarrationFetch = null;
      if (isAbortError(e) || myGen !== narrationGeneration) {
        onDone?.();
        return { ok: false };
      }
      const msg = e instanceof Error ? e.message : "Network error";
      publishNarrationError(msg);
      onError?.(msg);
      onDone?.();
      return { ok: false, error: msg };
    }

    if (activeNarrationFetch === ac) activeNarrationFetch = null;

    if (myGen !== narrationGeneration) {
      onDone?.();
      return { ok: false };
    }

    if (!response.ok) {
      let errBody = "";
      try {
        errBody = await response.text();
      } catch {
        /* ignore */
      }
      const msg = `Voice failed (${response.status})${errBody ? `: ${errBody.slice(0, 120)}` : ""}`;
      publishNarrationError(msg);
      onError?.(msg);
      onDone?.();
      return { ok: false, error: msg };
    }

    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await response.arrayBuffer();
    } catch (e) {
      if (isAbortError(e) || myGen !== narrationGeneration) {
        onDone?.();
        return { ok: false };
      }
      const msg = "Could not read audio from server";
      publishNarrationError(msg);
      onError?.(msg);
      onDone?.();
      return { ok: false, error: msg };
    }

    if (myGen !== narrationGeneration) {
      onDone?.();
      return { ok: false };
    }

    const mime = playbackMimeType(response, arrayBuffer);
    let fileUri: string;
    let nativeDisposablePath: string | null = null;

    if (Platform.OS === "web") {
      const blob = new Blob([arrayBuffer], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      narrationBlobDisposable = true;
      currentNarrationBlobUrl = blobUrl;
      fileUri = blobUrl;
    } else {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) {
        const msg = "No cache directory for audio";
        publishNarrationError(msg);
        onError?.(msg);
        onDone?.();
        return { ok: false, error: msg };
      }
      await deleteDisposableNarrationFile();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const filename = `tts_${Date.now()}_${narrationGeneration}.${extensionForMime(mime)}`;
      fileUri = `${cacheDir}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      disposableNarrationFileUri = fileUri;
      nativeDisposablePath = fileUri;
    }

    if (myGen !== narrationGeneration) {
      await deleteDisposableNarrationFile();
      if (Platform.OS === "web" && fileUri.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(fileUri);
        } catch {
          /* ignore */
        }
      }
      currentNarrationBlobUrl = null;
      narrationBlobDisposable = true;
      onDone?.();
      return { ok: false };
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true },
      );

      if (myGen !== narrationGeneration) {
        await sound.unloadAsync().catch(() => {});
        await deleteDisposableNarrationFile();
        if (Platform.OS === "web" && fileUri.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(fileUri);
          } catch {
            /* ignore */
          }
        }
        currentNarrationBlobUrl = null;
        narrationBlobDisposable = true;
        onDone?.();
        return { ok: false };
      }

      currentNarrationSound = sound;
      return await finishPlayback(sound, nativeDisposablePath);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not play narration audio";
      publishNarrationError(msg);
      onError?.(msg);
      await deleteDisposableNarrationFile();
      if (Platform.OS === "web" && typeof fileUri === "string" && fileUri.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(fileUri);
        } catch {
          /* ignore */
        }
      }
      currentNarrationBlobUrl = null;
      narrationBlobDisposable = true;
      onDone?.();
      return { ok: false, error: msg };
    }
  },

  /**
   * Prefetched file:// or blob: URI. Waits until playback finishes or stop preempts.
   * Does not delete prefetch-owned files on finish.
   */
  async playNarrationFromUri(
    uri: string,
    onDone?: () => void,
    onError?: (message: string) => void,
  ): Promise<NarrationPlayResult> {
    if (!uri?.trim()) {
      onDone?.();
      return { ok: true };
    }

    await this.stopNarration();
    publishNarrationError(null);

    const myGen = narrationGeneration;

    try {
      if (uri.startsWith("blob:")) {
        narrationBlobDisposable = false;
        currentNarrationBlobUrl = uri;
      } else {
        narrationBlobDisposable = true;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
      );

      if (myGen !== narrationGeneration) {
        await sound.unloadAsync().catch(() => {});
        onDone?.();
        return { ok: false };
      }

      currentNarrationSound = sound;

      return await new Promise<NarrationPlayResult>((resolve) => {
        let settled = false;
        const finish = (r: NarrationPlayResult) => {
          if (settled) return;
          settled = true;
          settleNarrationPlay = null;
          if (r.ok) onDone?.();
          resolve(r);
        };

        settleNarrationPlay = finish;

        sound.setOnPlaybackStatusUpdate(
          (status: {
            isLoaded: boolean;
            didJustFinish?: boolean;
            isLooping?: boolean;
          }) => {
            if (settled) return;
            if (
              !status.isLoaded ||
              !status.didJustFinish ||
              status.isLooping
            ) {
              return;
            }
            void sound.unloadAsync().then(() => {
              if (settled) return;
              if (currentNarrationSound === sound) {
                currentNarrationSound = null;
              }
              if (
                narrationBlobDisposable &&
                currentNarrationBlobUrl?.startsWith("blob:")
              ) {
                try {
                  URL.revokeObjectURL(currentNarrationBlobUrl);
                } catch {
                  /* ignore */
                }
              }
              currentNarrationBlobUrl = null;
              narrationBlobDisposable = true;
              finish({ ok: true });
            });
          },
        );
      });
    } catch (err) {
      if (myGen !== narrationGeneration) {
        onDone?.();
        return { ok: false };
      }
      const msg =
        err instanceof Error ? err.message : "Could not play narration audio";
      publishNarrationError(msg);
      onError?.(msg);
      onDone?.();
      return { ok: false, error: msg };
    }
  },

  /**
   * Stop and unload current narration. Preempts any in-flight fetch and invalidates pending playback.
   */
  async stopNarration(): Promise<void> {
    const preempt = settleNarrationPlay;
    settleNarrationPlay = null;
    preempt?.({ ok: false });

    bumpNarrationGeneration();
    abortNarrationFetch();

    if (currentNarrationBlobUrl && narrationBlobDisposable) {
      try {
        URL.revokeObjectURL(currentNarrationBlobUrl);
      } catch {
        /* ignore */
      }
    }
    currentNarrationBlobUrl = null;
    narrationBlobDisposable = true;

    await deleteDisposableNarrationFile();

    if (currentNarrationSound) {
      try {
        currentNarrationSound.setOnPlaybackStatusUpdate(null);
      } catch {
        /* ignore */
      }
      try {
        await currentNarrationSound.stopAsync();
        await currentNarrationSound.unloadAsync();
      } catch {
        /* ignore */
      }
      currentNarrationSound = null;
    }
  },

  /** True while a narration Sound instance is loaded. */
  isNarrationSoundLoaded(): boolean {
    return currentNarrationSound != null;
  },

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
