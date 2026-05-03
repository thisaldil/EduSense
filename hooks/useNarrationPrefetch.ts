/**
 * Prefetch narration clips (POST /api/tts/synthesize per cue) before timeline playback.
 * Strategy: Option B — bounded concurrency (default 3), cache URIs for sensoryManager.
 * Overlay should match useSensory (API audio_timeline or enrich-script narration cues).
 *
 * Deps: expo-av / expo-file-system used indirectly via services/narrationAudio.ts + audioClient.
 */
import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { getStoredToken } from "@/services/api";
import {
  clearPrefetchedNarrationCache,
  prefetchNarrationClips,
  type SegmentPrefetchState,
} from "@/services/narrationAudio";
import type { SensoryOverlay } from "@/types/sensory";
import { useSensoryStore } from "@/store/sensoryStore";

export type NarrationPrefetchPhase = "idle" | "loading" | "ready" | "error";

export function useNarrationPrefetch(sensoryOverlay: SensoryOverlay | null) {
  const audioEnabled = useSensoryStore((s) => s.audioEnabled);
  const [phase, setPhase] = useState<NarrationPrefetchPhase>("idle");
  const [segmentStates, setSegmentStates] = useState<
    Record<string, SegmentPrefetchState>
  >({});
  const [flags, setFlags] = useState({
    firstReady: false,
    allReady: false,
    anyError: false,
  });

  const hasNarration = !!sensoryOverlay?.narration?.length;

  const retryPrefetch = useCallback(async () => {
    await clearPrefetchedNarrationCache();
    setSegmentStates({});
    const ov = sensoryOverlay;
    if (!audioEnabled || !ov?.narration?.length) {
      setFlags({ firstReady: true, allReady: true, anyError: false });
      setPhase("ready");
      return;
    }
    setPhase("loading");
    const token = await getStoredToken();
    const result = await prefetchNarrationClips({
      apiBase: API_BASE_URL,
      token,
      overlay: ov,
      concurrency: 3,
      onSegmentUpdate: (id, state) => {
        setSegmentStates((prev) => ({ ...prev, [id]: state }));
      },
    });
    setFlags({
      firstReady: result.firstReady,
      allReady: result.allReady,
      anyError: result.anyError,
    });
    if (result.anyError && !result.allReady) {
      setPhase("error");
    } else {
      setPhase("ready");
    }
  }, [sensoryOverlay, audioEnabled]);

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;

    void (async () => {
      await clearPrefetchedNarrationCache();
      if (cancelled || ac.signal.aborted) return;
      setSegmentStates({});
      setFlags({ firstReady: false, allReady: false, anyError: false });

      const ov = sensoryOverlay;
      if (!audioEnabled || !ov?.narration?.length) {
        setFlags({ firstReady: true, allReady: true, anyError: false });
        setPhase("ready");
        return;
      }

      setPhase("loading");
      const token = await getStoredToken();
      const result = await prefetchNarrationClips({
        apiBase: API_BASE_URL,
        token,
        overlay: ov,
        concurrency: 3,
        signal: ac.signal,
        onSegmentUpdate: (id, state) => {
          if (!ac.signal.aborted) {
            setSegmentStates((prev) => ({ ...prev, [id]: state }));
          }
        },
      });

      if (cancelled || ac.signal.aborted) return;

      setFlags({
        firstReady: result.firstReady,
        allReady: result.allReady,
        anyError: result.anyError,
      });
      if (result.anyError && !result.allReady) {
        setPhase("error");
      } else {
        setPhase("ready");
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      void clearPrefetchedNarrationCache();
    };
  }, [sensoryOverlay, audioEnabled]);

  const canStartPlayback =
    !audioEnabled ||
    !hasNarration ||
    (phase === "ready" && flags.allReady && !flags.anyError);

  const playDisabledReason =
    audioEnabled && hasNarration && phase === "loading"
      ? "Loading narration audio…"
      : audioEnabled && hasNarration && phase === "error"
        ? "Narration download failed"
        : undefined;

  return {
    prefetchPhase: phase,
    segmentStates,
    overlay: sensoryOverlay,
    hasNarration,
    firstClipReady: flags.firstReady,
    allClipsReady: flags.allReady,
    prefetchHadErrors: flags.anyError,
    canStartPlayback,
    playDisabledReason,
    retryPrefetch,
  };
}
