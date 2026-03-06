import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { neuroApi } from "@/services/api";

// Canonical frontend load states (match baseline_cognitive_load)
export type LoadState = "LOW_LOAD" | "OPTIMAL" | "OVERLOAD";

export interface NeuroState {
  baselineState?: LoadState;
  currentState: LoadState;
  confidence: number;
  isForced: boolean;
}

// Backend prediction response shape
export type PredictResponse = neuroApi.PredictResponse;

interface NeuroStateContextValue {
  state: NeuroState;
  /** Update from /api/v1/predict response */
  updateStateFromPrediction: (prediction: PredictResponse) => void;
  /** Force override via “Simplify Me” / “Deep Dive” buttons */
  forceStateOverride: (newState: LoadState) => void;
  /** Optionally set baseline after calibration */
  setBaselineState: (baseline: LoadState) => void;
}

const NeuroStateContext = createContext<NeuroStateContextValue | undefined>(
  undefined,
);

interface NeuroStateProviderProps {
  children: ReactNode;
}

export const NeuroStateProvider = ({ children }: NeuroStateProviderProps) => {
  const { user } = useAuth();
  const [state, setState] = useState<NeuroState>({
    currentState: "OPTIMAL",
    confidence: 1.0,
    isForced: false,
  });

  // Initialize from user's baseline once it's available
  useEffect(() => {
    const rawBaseline = (user as any)?.baseline_cognitive_load as
      | "LOW_LOAD"
      | "OPTIMAL"
      | "OVERLOAD"
      | undefined;
    if (!rawBaseline) return;

    // Normalize any legacy values into our three canonical states
    const baseline: LoadState =
      rawBaseline === "LOW_LOAD"
        ? "LOW_LOAD"
        : rawBaseline === "OVERLOAD"
          ? "OVERLOAD"
          : "OPTIMAL";

    setState((prev) => {
      // If we've already set a baseline, don't override user-driven changes
      if (prev.baselineState === baseline && prev.currentState !== "OPTIMAL") {
        return prev;
      }
      return {
        ...prev,
        baselineState: baseline,
        currentState: baseline,
        isForced: false,
      };
    });
  }, [user]);

  const updateStateFromPrediction = useCallback(
    (predictionResponse: PredictResponse) => {
      // Map backend state ("LOW" | "OPTIMAL" | "OVERLOAD") into our canonical LoadState
      const mapped: LoadState =
        predictionResponse.state === "LOW"
          ? "LOW_LOAD"
          : predictionResponse.state === "OVERLOAD"
            ? "OVERLOAD"
            : "OPTIMAL";

      setState((prev) => ({
        ...prev,
        currentState: mapped,
        confidence: predictionResponse.confidence,
        isForced: false,
      }));
    },
    [],
  );

  const forceStateOverride = useCallback((newState: LoadState) => {
    setState((prev) => ({
      ...prev,
      currentState: newState,
      isForced: true,
    }));
  }, []);

  const setBaselineState = useCallback((baseline: LoadState) => {
    setState((prev) => ({
      ...prev,
      baselineState: baseline,
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      updateStateFromPrediction,
      forceStateOverride,
      setBaselineState,
    }),
    [state, updateStateFromPrediction, forceStateOverride, setBaselineState],
  );

  return (
    <NeuroStateContext.Provider value={value}>
      {children}
    </NeuroStateContext.Provider>
  );
};

export const useNeuroState = (): NeuroStateContextValue => {
  const ctx = useContext(NeuroStateContext);
  if (!ctx) {
    throw new Error("useNeuroState must be used within a NeuroStateProvider");
  }
  return ctx;
};
