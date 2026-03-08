import { Audio } from "expo-av";

type LoopId = "40hz_gamma" | "spatial_music";

const loops: Record<string, Audio.Sound | null> = {};

export const audioClient = {
  /**
   * Play a one-shot narration or SFX.
   * For now this is a stub that could be wired to TTS or static assets.
   */
  async playOneShot(textOrId: string): Promise<void> {
    // Placeholder: hook into a TTS engine or simple sound effect here.
    console.log("[audioClient] playOneShot:", textOrId);
  },

  /**
   * Start an ambient loop. Implementation can be backed by local assets.
   */
  async playLoop(id: LoopId): Promise<void> {
    if (loops[id]) return;
    console.log("[audioClient] playLoop:", id);
    // Example placeholder; replace with actual asset URIs if available.
    const sound = new Audio.Sound();
    try {
      // await sound.loadAsync(require("../assets/audio/ambient_40hz.mp3"));
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

