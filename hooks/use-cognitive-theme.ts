import { useMemo } from "react";

import {
  type CognitiveLoadState,
  getCognitiveTheme,
} from "@/constants/theme";
import { useNeuroState } from "@/context/NeuroStateContext";

export function useCognitiveTheme() {
  const { state } = useNeuroState();
  const cognitiveState = state.currentState as CognitiveLoadState;

  const theme = useMemo(
    () => getCognitiveTheme(cognitiveState),
    [cognitiveState],
  );

  return {
    cognitiveState,
    theme,
  };
}
