/**
 * Timeline narration status: caption text is shown in the lesson scene narration area to avoid duplication.
 *
 * Deps: React Native primitives only; pairs with hooks/useNarrationPrefetch.ts
 */
import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { SensoryOverlay } from "@/types/sensory";
import type { SegmentPrefetchState } from "@/services/narrationAudio";
import { activeNarrationCue } from "@/utils/audioTimeline";

type Props = {
  overlay: SensoryOverlay | null;
  currentTimeMs: number;
  segmentStates: Record<string, SegmentPrefetchState>;
  audioEnabled: boolean;
};

export function NarrationTimelineCaption({
  overlay,
  currentTimeMs,
  segmentStates,
  audioEnabled,
}: Props) {
  const active = useMemo(() => {
    if (!overlay?.narration?.length) return null;
    return activeNarrationCue(currentTimeMs, overlay.narration);
  }, [overlay, currentTimeMs]);

  if (!overlay?.narration?.length || !audioEnabled) return null;

  // Caption text is shown once in lesson-player scene narration; avoid duplicating it here.
  if (!active) return null;

  const seg = segmentStates[active.id];
  const ready = seg?.status === "ready";
  const err = seg?.status === "error" ? seg.message : undefined;

  return (
    <View style={st.box}>
      {/* <Text style={st.label}>NARRATION (timeline)</Text>
      {!ready && !err ? (
        <View style={st.row}>
          <ActivityIndicator color="#2563EB" />
          <Text style={[st.loading, st.loadingPad]}>Preparing voice…</Text>
        </View>
      ) : err ? (
        <Text style={st.error}>{err}</Text>
      ) : null} */}
    </View>
  );
}

const st = StyleSheet.create({
  box: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  row: { flexDirection: "row", alignItems: "center" },
  loading: { fontSize: 14, color: "#475569" },
  loadingPad: { marginLeft: 8 },
  error: { fontSize: 13, color: "#B91C1C" },
});
