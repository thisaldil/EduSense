export type SceneEnvironment = "minimal" | "classroom" | "nature" | "science";

export type SupportedAnimation =
  | "idle"
  | "appear"
  | "pulse"
  | "sway"
  | "rotate"
  | "grow"
  | "fall"
  | "drift"
  | "float"
  | "glow";

export interface BackendTimelineStep {
  at?: number;
  action?: string;
  alpha?: number;
  opacity?: number;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  scale?: number;
  rotation?: number;
  visible?: boolean;
}

export interface BackendActor {
  type?: string;
  x?: number;
  y?: number;
  animation?: string;
  color?: string;
  count?: number;
  size?: number;
  angle?: number;
  length?: number;
  text?: string;
  fontSize?: number;
  extra?: Record<string, unknown>;
  timeline?: BackendTimelineStep[];
  [key: string]: unknown;
}

export interface BackendScene {
  id?: string;
  startTime?: number;
  duration?: number;
  text?: string;
  actors?: BackendActor[];
  environment?: string;
  [key: string]: unknown;
}

export interface BackendAnimationScript {
  title?: string;
  duration?: number;
  scenes?: BackendScene[];
  concept?: string;
  [key: string]: unknown;
}

export interface NormalizedTimelineStep {
  at: number;
  action: SupportedAnimation;
  alpha?: number;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  scale?: number;
  rotation?: number;
  visible?: boolean;
}

export interface NormalizedActor extends BackendActor {
  id: string;
  type: string;
  x: number;
  y: number;
  animation: SupportedAnimation;
  color: string;
  count: number;
  size: number;
  angle: number;
  length: number;
  text: string;
  fontSize: number;
  timeline: NormalizedTimelineStep[];
}

export interface NormalizedScene {
  id: string;
  startTime: number;
  duration: number;
  text: string;
  environment: SceneEnvironment;
  actors: NormalizedActor[];
  raw: BackendScene;
}

export interface NormalizedAnimationScript {
  title: string;
  duration: number;
  scenes: NormalizedScene[];
  concept: string;
  raw?: BackendAnimationScript;
}

export interface ActorRuntimeState {
  x: number;
  y: number;
  alpha: number;
  scale: number;
  rotation: number;
  visible: boolean;
}
