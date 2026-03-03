import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { neuroApi } from "@/services/api";

type InteractionType =
  | "ANSWER_CHANGE"
  | "IDLE_GAP"
  | "ERROR"
  | "CORRECT"
  | "INCORRECT"
  | "NAV_BACK"
  | "NAV_FORWARD"
  | "SECTION_START"
  | "SECTION_END";

interface BehaviorEvent {
  type: InteractionType;
  timestamp: number;
  payload?: Record<string, unknown>;
}

interface AnalyticsBuffer {
  total_time_seconds: number;
  answer_changes: number;
  idle_gaps: number;
  error_streak: number;
  accuracy_rate: number;
  correct_answers: number;
  incorrect_answers: number;
  back_navigations: number;
  forward_navigations: number;
  question_interactions: BehaviorEvent[];
}

const initialBuffer: AnalyticsBuffer = {
  total_time_seconds: 0,
  answer_changes: 0,
  idle_gaps: 0,
  error_streak: 0,
  accuracy_rate: 0,
  correct_answers: 0,
  incorrect_answers: 0,
  back_navigations: 0,
  forward_navigations: 0,
  question_interactions: [],
};

interface AnalyticsLoggerContextValue {
  logInteraction: (type: InteractionType, payload?: Record<string, unknown>) => void;
  /** Call at the end of a section to get a prediction and reset buffer */
  triggerPrediction: () => Promise<neuroApi.PredictResponse | null>;
  /** Manually reset buffer (e.g. when starting calibration or a new lesson) */
  resetBuffer: () => void;
}

const AnalyticsLoggerContext = createContext<
  AnalyticsLoggerContextValue | undefined
>(undefined);

interface AnalyticsLoggerProviderProps {
  children: ReactNode;
}

export const AnalyticsLoggerProvider = ({
  children,
}: AnalyticsLoggerProviderProps) => {
  // Mutable buffer – avoids re-renders on every interaction event
  const bufferRef = useRef<AnalyticsBuffer>({ ...initialBuffer });
  const sectionStartRef = useRef<number | null>(null);

  const logInteraction = useCallback(
    (type: InteractionType, payload?: Record<string, unknown>) => {
      const now = Date.now();
      const buffer = bufferRef.current;

      if (type === "SECTION_START") {
        sectionStartRef.current = now;
      }

      if (type === "SECTION_END" && sectionStartRef.current) {
        const deltaMs = now - sectionStartRef.current;
        buffer.total_time_seconds += deltaMs / 1000;
        sectionStartRef.current = null;
      }

      if (type === "ANSWER_CHANGE") {
        buffer.answer_changes += 1;
      }

      if (type === "IDLE_GAP") {
        buffer.idle_gaps += 1;
      }

      if (type === "ERROR") {
        buffer.error_streak += 1;
      }

      if (type === "CORRECT") {
        buffer.correct_answers += 1;
      }

      if (type === "INCORRECT") {
        buffer.incorrect_answers += 1;
      }

      if (type === "NAV_BACK") {
        buffer.back_navigations += 1;
      }

      if (type === "NAV_FORWARD") {
        buffer.forward_navigations += 1;
      }

      // Update simple accuracy rate if we have any answered questions
      const totalAnswered = buffer.correct_answers + buffer.incorrect_answers;
      if (totalAnswered > 0) {
        buffer.accuracy_rate = buffer.correct_answers / totalAnswered;
      }

      buffer.question_interactions.push({
        type,
        timestamp: now,
        payload,
      });
    },
    [],
  );

  const triggerPrediction = useCallback(
    async (): Promise<neuroApi.PredictResponse | null> => {
      const snapshot = bufferRef.current;

      // Avoid calling backend if we have essentially no data
      if (
        snapshot.total_time_seconds <= 0 &&
        snapshot.question_interactions.length === 0
      ) {
        return null;
      }

      const requestBody: neuroApi.PredictRequest = {
        total_time_seconds: snapshot.total_time_seconds,
        total_questions:
          snapshot.correct_answers + snapshot.incorrect_answers || undefined,
        question_interactions: snapshot.question_interactions,
        back_navigations: snapshot.back_navigations,
        forward_navigations: snapshot.forward_navigations,
        answer_changes: snapshot.answer_changes,
        correct_answers: snapshot.correct_answers,
        incorrect_answers: snapshot.incorrect_answers,
      };

      const response = await neuroApi.predict(requestBody);

      // Reset buffer for next section after a successful prediction
      bufferRef.current = { ...initialBuffer };
      sectionStartRef.current = null;

      return response;
    },
    [],
  );

  const resetBuffer = useCallback(() => {
    bufferRef.current = { ...initialBuffer };
    sectionStartRef.current = null;
  }, []);

  const value = useMemo(
    () => ({
      logInteraction,
      triggerPrediction,
      resetBuffer,
    }),
    [logInteraction, triggerPrediction, resetBuffer],
  );

  return (
    <AnalyticsLoggerContext.Provider value={value}>
      {children}
    </AnalyticsLoggerContext.Provider>
  );
};

export const useAnalyticsLogger = (): AnalyticsLoggerContextValue => {
  const ctx = useContext(AnalyticsLoggerContext);
  if (!ctx) {
    throw new Error(
      "useAnalyticsLogger must be used within an AnalyticsLoggerProvider",
    );
  }
  return ctx;
};

