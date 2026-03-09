import { AnimationCanvasWebView } from "./AnimationCanvasWebView";

type Props = {
  isPlaying: boolean;
  script?: any | null;
  currentTimeMs?: number;
};

export function AnimationCanvasNative({ isPlaying, script, currentTimeMs }: Props) {
  return (
    <AnimationCanvasWebView
      isPlaying={isPlaying}
      script={script}
      currentTimeMs={currentTimeMs}
    />
  );
}
