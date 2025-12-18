declare module "expo-av" {
  import * as React from "react";

  // Minimal type surface for this project – extend as needed
  export type AVPlaybackStatus = any;

  export interface VideoMethods {
    playAsync: () => Promise<void>;
    pauseAsync: () => Promise<void>;
  }

  export class Video extends React.Component<any> implements VideoMethods {
    playAsync(): Promise<void>;
    pauseAsync(): Promise<void>;
  }
}


