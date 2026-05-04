/**
 * TTS prefetch + local file playback helpers for POST /api/tts/synthesize.
 *
 * Deps: expo-av (playback in audioClient), expo-file-system (cache files on iOS/Android).
 * Hermes has no btoa — we use a small base64 encoder for writing binary to disk.
 */
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { API_ENDPOINTS } from "@/config/api";
import type { SpeechRate } from "@/services/audioClient";
import { enrichedScriptToSensoryOverlay, type SensoryOverlay } from "@/types/sensory";

const TTS_PATH = API_ENDPOINTS.TTS_SYNTHESIZE;

/** In-memory map: narration cue id → prefetched playable URI (file:// or blob:). */
const prefetchedUriByCueId = new Map<string, string>();

export function registerPrefetchedNarrationUri(cueId: string, uri: string): void {
  prefetchedUriByCueId.set(cueId, uri);
}

export function getPrefetchedNarrationUri(cueId: string): string | undefined {
  return prefetchedUriByCueId.get(cueId);
}

export async function clearPrefetchedNarrationCache(): Promise<void> {
  for (const uri of prefetchedUriByCueId.values()) {
    if (uri.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(uri);
      } catch {}
    } else if (uri.startsWith("file")) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {}
    }
  }
  prefetchedUriByCueId.clear();
}

export function removePrefetchedNarrationEntry(cueId: string): void {
  const uri = prefetchedUriByCueId.get(cueId);
  if (uri?.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(uri);
    } catch {}
  }
  prefetchedUriByCueId.delete(cueId);
}

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

export type SynthesizeResult = {
  uri: string;
  mime: string;
  ttsProvider?: string;
};

/**
 * POST /api/tts/synthesize, write bytes to a local URI (or blob URL on web), return playable uri.
 * Do not pass the POST URL to the player — use the returned file:// or blob: uri with expo-av.
 */
export async function synthesizeToLocalUri(
  apiBase: string,
  token: string | null,
  text: string,
  speechRate: SpeechRate,
  signal?: AbortSignal,
): Promise<SynthesizeResult> {
  const base = apiBase.replace(/\/$/, "");
  const url = `${base}${TTS_PATH}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      text: String(text).trim(),
      speech_rate: speechRate,
    }),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `TTS ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const mime = playbackMimeType(response, arrayBuffer);
  const ttsProvider = response.headers.get("X-TTS-Provider") ?? undefined;

  if (Platform.OS === "web") {
    const blob = new Blob([arrayBuffer], { type: mime });
    const uri = URL.createObjectURL(blob);
    return { uri, mime, ttsProvider };
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error("No cache directory");
  const base64 = arrayBufferToBase64(arrayBuffer);
  const filename = `tts_${Date.now()}_${Math.random().toString(36).slice(2)}.${extensionForMime(mime)}`;
  const fileUri = `${cacheDir}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { uri: fileUri, mime, ttsProvider };
}

export function normalizeSpeechRate(v: unknown): SpeechRate {
  if (v === "slow" || v === "normal" || v === "fast") return v;
  return "normal";
}

/** Raw timeline row from API/session (ms). */
export type TimelineRowInput = {
  at?: number;
  duration?: number;
  text?: string;
};

export type NormalizedTimelineRow = {
  atMs: number;
  durationMs: number;
  text: string;
};

export function normalizeTimelineRow(
  row: TimelineRowInput | Record<string, unknown>,
): NormalizedTimelineRow | null {
  const at = typeof row.at === "number" ? row.at : Number(row.at);
  const duration =
    typeof row.duration === "number" ? row.duration : Number(row.duration);
  const text = typeof row.text === "string" ? row.text.trim() : "";
  if (!text || !Number.isFinite(at) || at < 0) return null;
  return {
    atMs: at,
    durationMs: Number.isFinite(duration) && duration >= 0 ? duration : 0,
    text,
  };
}

export type SegmentPrefetchState =
  | { status: "pending" }
  | { status: "loading" }
  | { status: "ready"; uri: string; mime: string; ttsProvider?: string }
  | { status: "error"; message: string };

export type PrefetchNarrationResult = {
  segments: Record<string, SegmentPrefetchState>;
  firstReady: boolean;
  allReady: boolean;
  anyError: boolean;
};

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
  signal?: AbortSignal,
): Promise<void> {
  let i = 0;
  async function runOne(): Promise<void> {
    while (i < items.length) {
      if (signal?.aborted) return;
      const idx = i++;
      await worker(items[idx], idx);
    }
  }
  const n = Math.min(concurrency, Math.max(1, items.length));
  await Promise.all(Array.from({ length: n }, () => runOne()));
}

/**
 * Prefetch each narration cue (POST per item). Bounded concurrency.
 * Registers URIs in the global prefetch map for sensoryManager + audioClient.
 */
export async function prefetchNarrationClips(options: {
  apiBase: string;
  token: string | null;
  overlay: SensoryOverlay;
  concurrency?: number;
  signal?: AbortSignal;
  onSegmentUpdate?: (
    cueId: string,
    state: SegmentPrefetchState,
  ) => void;
}): Promise<PrefetchNarrationResult> {
  const { apiBase, token, overlay, concurrency = 3, signal, onSegmentUpdate } =
    options;

  const segments: Record<string, SegmentPrefetchState> = {};
  const cues = overlay.narration.filter((c) => c.text?.trim());

  if (cues.length === 0) {
    return { segments, firstReady: true, allReady: true, anyError: false };
  }

  for (const c of cues) {
    segments[c.id] = { status: "pending" };
    onSegmentUpdate?.(c.id, segments[c.id]);
  }

  await runPool(
    cues,
    concurrency,
    async (cue) => {
      if (signal?.aborted) return;
      segments[cue.id] = { status: "loading" };
      onSegmentUpdate?.(cue.id, segments[cue.id]);
      try {
        const result = await synthesizeToLocalUri(
          apiBase,
          token,
          cue.text,
          overlay.speechRate,
          signal,
        );
        if (signal?.aborted) return;
        registerPrefetchedNarrationUri(cue.id, result.uri);
        segments[cue.id] = {
          status: "ready",
          uri: result.uri,
          mime: result.mime,
          ttsProvider: result.ttsProvider,
        };
        onSegmentUpdate?.(cue.id, segments[cue.id]);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        segments[cue.id] = { status: "error", message };
        onSegmentUpdate?.(cue.id, segments[cue.id]);
      }
    },
    signal,
  );

  const anyError = Object.values(segments).some((s) => s.status === "error");
  const allReady = cues.every((c) => segments[c.id]?.status === "ready");
  const firstReady = cues.some((c) => segments[c.id]?.status === "ready");

  return {
    segments,
    firstReady,
    allReady,
    anyError,
  };
}

/** Build overlay from playback script for prefetch (same mapping as useSensory). */
export function overlayFromPlaybackScript(
  script: Parameters<typeof enrichedScriptToSensoryOverlay>[0] | null,
): SensoryOverlay | null {
  if (!script) return null;
  return enrichedScriptToSensoryOverlay(script);
}
