import { create } from "zustand";
import type { SensoryOverlay } from "@/types/sensory";

type CueKind = "HAPTIC" | "AUDIO";

export type LastCue = {
  id: string;
  type: CueKind;
  timeMs: number;
  patternOrText: string;
};

const MAX_LAST_CUES = 5;

export type SensoryState = {
  hapticsEnabled: boolean;
  audioEnabled: boolean;
  cognitiveState: string;
  lastCue?: LastCue;
  /** Last N cues for dev debug overlay */
  lastCues: LastCue[];
  currentOverlay?: SensoryOverlay;
  sessionId?: string;

  setHapticsEnabled: (v: boolean) => void;
  setAudioEnabled: (v: boolean) => void;
  setCognitiveState: (state: string) => void;
  setLastCue: (cue: LastCue | undefined) => void;
  setOverlay: (overlay: SensoryOverlay | undefined) => void;
  setSessionId: (id: string | undefined) => void;
};

export const useSensoryStore = create<SensoryState>((set) => ({
  hapticsEnabled: true,
  audioEnabled: true,
  cognitiveState: "neutral",
  lastCue: undefined,
  lastCues: [],
  currentOverlay: undefined,
  sessionId: undefined,

  setHapticsEnabled: (v) => set({ hapticsEnabled: v }),
  setAudioEnabled: (v) => set({ audioEnabled: v }),
  setCognitiveState: (state) => set({ cognitiveState: state }),
  setLastCue: (cue) =>
    set((s) => ({
      lastCue: cue,
      lastCues: cue
        ? [cue, ...s.lastCues].slice(0, MAX_LAST_CUES)
        : s.lastCues,
    })),
  setOverlay: (overlay) => set({ currentOverlay: overlay }),
  setSessionId: (id) => set({ sessionId: id }),
}));

