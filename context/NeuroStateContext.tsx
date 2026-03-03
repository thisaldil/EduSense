import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LoadState = "LOW" | "OPTIMAL" | "OVERLOAD";

export interface NeuroState {
  baselineState?: LoadState;
  currentState: LoadState;
  confidence: number;
  isForced: boolean;
}

export interface PredictResponse {
  state: LoadState;
  confidence: number;
  // Allow extra fields without forcing the shape
  [key: string]: unknown;
}

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
  const [state, setState] = useState<NeuroState>({
    currentState: "OPTIMAL",
    confidence: 1.0,
    isForced: false,
  });

  const updateStateFromPrediction = useCallback(
    (predictionResponse: PredictResponse) => {
      setState((prev) => ({
        ...prev,
        currentState: predictionResponse.state,
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

