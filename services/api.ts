/**
 * API Client
 * Handles all HTTP requests to the backend
 */

import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const WEB_TOKEN_KEY = "edusense_auth_token";
const USER_KEY = "auth_user";
const WEB_USER_KEY = "edusense_auth_user";

// Check if we're on web
const isWeb = Platform.OS === "web";

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Get stored authentication token
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      // Use localStorage on web
      return localStorage.getItem(WEB_TOKEN_KEY);
    } else {
      // Use SecureStore on native platforms
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    return null;
  }
};

/**
 * Store authentication token
 */
export const storeToken = async (token: string): Promise<void> => {
  try {
    if (isWeb) {
      // Use localStorage on web
      localStorage.setItem(WEB_TOKEN_KEY, token);
    } else {
      // Use SecureStore on native platforms
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Remove stored authentication token
 */
export const removeStoredToken = async (): Promise<void> => {
  try {
    if (isWeb) {
      // Use localStorage on web
      localStorage.removeItem(WEB_TOKEN_KEY);
    } else {
      // Use SecureStore on native platforms
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    // Silently fail
  }
};

/**
 * Get stored user (for session restoration after reload)
 */
export const getStoredUser = async <T = unknown>(): Promise<T | null> => {
  try {
    let raw: string | null;
    if (isWeb) {
      raw = localStorage.getItem(WEB_USER_KEY);
    } else {
      raw = await SecureStore.getItemAsync(USER_KEY);
    }
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/**
 * Store user (for session restoration after reload)
 */
export const storeUser = async (user: unknown): Promise<void> => {
  try {
    const raw = JSON.stringify(user);
    if (isWeb) {
      localStorage.setItem(WEB_USER_KEY, raw);
    } else {
      await SecureStore.setItemAsync(USER_KEY, raw);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Remove stored user
 */
export const removeStoredUser = async (): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.removeItem(WEB_USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch {
    // Silently fail
  }
};

/** Called when backend returns 401 so the app can clear auth state and redirect to login */
let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Format FastAPI-style error into a single message string.
 * Handles detail as string or array of { loc, msg }.
 */
function formatApiErrorMessage(data: any, status: number): string {
  if (data?.message && typeof data.message === "string") return data.message;
  const d = data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d.length > 0) {
    const messages = d.map((e: any) => (e?.msg != null ? e.msg : String(e)));
    return messages.join(". ");
  }
  if (status === 400) return "Bad request. Check your input and try again.";
  if (status === 422) return "Validation failed. Check your input and try again.";
  return "An error occurred";
}

/**
 * Convert FastAPI validation detail array to { field: string[] } for UI.
 */
function detailArrayToErrors(detail: any[]): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const e of detail) {
    const msg = e?.msg ?? String(e);
    const loc = e?.loc;
    const field = Array.isArray(loc) ? loc[loc.length - 1] : "error";
    const key = String(field);
    if (!errors[key]) errors[key] = [];
    errors[key].push(msg);
  }
  return errors;
}

export function setOnUnauthorized(callback: (() => void) | null): void {
  onUnauthorizedCallback = callback;
}

/** Clear stored auth (token + user). Call on 401 so UI and storage stay in sync. */
export const clearStoredAuth = async (): Promise<void> => {
  await removeStoredToken();
  await removeStoredUser();
  onUnauthorizedCallback?.();
};

/**
 * Make an API request with authentication
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = await getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add authentication token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      // In dev, log the full error response so you can see why the backend rejected the request
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.warn(`[API] ${response.status} ${response.statusText}`, url, data);
      }
      // Clear auth only when an authenticated request gets 401 (expired/invalid token).
      // Do NOT clear on 401 from login/register – that just means wrong credentials.
      const isAuthEndpoint = url.includes("/api/auth/login") || url.includes("/api/auth/register");
      if (response.status === 401 && !isAuthEndpoint) {
        await clearStoredAuth();
      }
      // FastAPI: detail can be string or array of { loc, msg }; 400/422 often carry validation info
      const message = formatApiErrorMessage(data, response.status);
      const errors = data.errors ?? (Array.isArray(data.detail) ? detailArrayToErrors(data.detail) : undefined);
      const error: ApiError = {
        message,
        status: response.status,
        errors,
      };
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof Error && "message" in error && "status" in error) {
      throw error as ApiError;
    }
    throw {
      message:
        error instanceof Error ? error.message : "Network error occurred",
      status: undefined,
    } as ApiError;
  }
};

/**
 * GET request
 */
export const apiGet = <T = any>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: "GET" });
};

/**
 * POST request
 */
export const apiPost = <T = any>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * PUT request
 */
export const apiPut = <T = any>(endpoint: string, data?: any): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * DELETE request
 */
export const apiDelete = <T = any>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: "DELETE" });
};

/**
 * Map baseline_cognitive_load → wire cognitive_state for visual engine.
 */
export function mapBaselineToVisualState(
  baseline: string | null | undefined,
): "OVERLOAD" | "OPTIMAL" | "LOW_LOAD" {
  const upper = (baseline || "").toUpperCase().trim();
  if (upper === "LOW" || upper === "LOW_LOAD") return "LOW_LOAD";
  if (upper === "OVERLOAD" || upper === "HIGH") {
    return "OVERLOAD";
  }
  // Default: treat anything else as OPTIMAL
  return "OPTIMAL";
}

/**
 * Neuro-adaptive animation types and client (Member 2)
 */

export namespace animationApi {
  export type SalienceLevel = "low" | "medium" | "high";

  export interface NeuroAdaptiveActor {
    id?: string;
    type: string;
    x?: number;
    y?: number;
    animation?: string;
    timeline?: any[];
    color?: string;
    [key: string]: any;
  }

  export interface NeuroAdaptiveScene {
    id: string;
    startTime: number;
    duration: number;
    text?: string;
    actors: NeuroAdaptiveActor[];
    environment?: "minimal" | "default" | "rich";
    meta?: {
      cognitiveState?: string;
      tier?: string;
      ctmlPrinciples?: string[];
      salienceLevel?: SalienceLevel;
      [key: string]: any;
    };
  }

  export interface NeuroAdaptiveAnimationScript {
    title?: string;
    duration: number;
    scenes: NeuroAdaptiveScene[];
  }

  export interface NeuroAdaptiveAnimationResponseMeta {
    cognitiveState: string;
    tier?: string;
    ctmlPrinciples?: string[];
    salienceLevel?: SalienceLevel;
    [key: string]: any;
  }

  export interface NeuroAdaptiveAnimationResponse {
    script: NeuroAdaptiveAnimationScript;
    source: string;
    concept?: string;
    cognitive_state: "OVERLOAD" | "OPTIMAL" | "LOW_LOAD";
    tier?: string;
    student_id?: string;
    lesson_id?: string | null;
    session_id?: string | null;
    meta?: NeuroAdaptiveAnimationResponseMeta;
  }

  export interface NeuroAdaptiveAnimationRequest {
    transmuted_text: string;
    cognitive_state: "OVERLOAD" | "OPTIMAL" | "LOW_LOAD";
    concept?: string;
    student_id?: string;
    lesson_id?: string | null;
    session_id?: string | null;
  }

  export const fetchNeuroAdaptiveAnimation = (
    body: NeuroAdaptiveAnimationRequest,
  ) =>
    apiPost<NeuroAdaptiveAnimationResponse>(
      API_ENDPOINTS.ANIMATION_NEURO_ADAPTIVE,
      body,
    );

  export interface PostNeuroAdaptiveScriptArgs {
    transmutedText: string;
    cognitiveState: "OVERLOAD" | "OPTIMAL" | "LOW_LOAD";
    concept: string;
    studentId: string;
    lessonId?: string | null;
    sessionId?: string;
  }

  /**
   * POST /api/animation/neuro-adaptive
   * Generate and log a new neuro-adaptive visual script.
   */
  export const postNeuroAdaptiveScript = (
    args: PostNeuroAdaptiveScriptArgs,
  ): Promise<NeuroAdaptiveAnimationResponse> =>
    fetchNeuroAdaptiveAnimation({
      transmuted_text: args.transmutedText,
      cognitive_state: args.cognitiveState,
      concept: args.concept,
      lesson_id: args.lessonId ?? null,
      student_id: args.studentId,
      session_id: args.sessionId ?? undefined,
    });

  /**
   * GET /api/animation/neuro-adaptive/latest
   * Fetch latest saved neuro-adaptive script for reuse (by student/session).
   * Returns null if backend responds with 404.
   */
  export const getLatestNeuroAdaptiveScript = async (
    studentId: string,
    sessionId?: string,
  ): Promise<NeuroAdaptiveAnimationResponse | null> => {
    const search = new URLSearchParams();
    search.set("student_id", studentId);
    if (sessionId) search.set("session_id", sessionId);

    const endpoint = `/api/animation/neuro-adaptive/latest?${search.toString()}`;

    try {
      return await apiGet<NeuroAdaptiveAnimationResponse>(endpoint);
    } catch (err: any) {
      if (err?.status === 404) {
        return null;
      }
      throw err;
    }
  };
}

/**
 * Higher-level domain-specific API helpers
 * These wrap the low-level apiGet/apiPost/etc with concrete endpoints.
 */

// Neuro-adaptive endpoints (Member 1 + calibration, prediction, adaptive content)

export namespace neuroApi {
  export interface CalibrationRequest {
    total_time_seconds: number;
    total_questions?: number;
    question_interactions?: unknown[];
    back_navigations?: number;
    forward_navigations?: number;
    answer_changes?: number;
    [key: string]: unknown;
  }

  export interface CalibrationResponse {
    baseline_state: "LOW" | "OPTIMAL" | "OVERLOAD";
    confidence?: number;
    baseline_features?: unknown;
    [key: string]: unknown;
  }

  export interface PredictRequest {
    total_time_seconds: number;
    total_questions?: number;
    question_interactions?: unknown[];
    back_navigations?: number;
    forward_navigations?: number;
    answer_changes?: number;
    correct_answers?: number;
    incorrect_answers?: number;
    [key: string]: unknown;
  }

  export interface PredictResponse {
    state: "LOW" | "OPTIMAL" | "OVERLOAD";
    confidence: number;
    [key: string]: unknown;
  }

  export type CognitiveStateWire = "LOW_LOAD" | "OPTIMAL" | "OVERLOAD";

  export interface TransmuteRequest {
    text: string;
    cognitive_state: CognitiveStateWire;
    session_id?: string;
  }

  /**
   * Member 1 – Adaptive Text Engine response (simplified shape).
   * Backend may include extra research metrics, so we keep it extensible.
   */
  export interface TransmuteResponse {
    transmuted_text: string;
    tier_applied: string;
    flesch_kincaid_grade: number;
    dependency_distance: number;
    original_complexity_score: number;
    keywords_preserved: string[];
    llm_error: string | null;
    [key: string]: any;
  }

  export const calibrate = (body: CalibrationRequest) =>
    apiPost<CalibrationResponse>("/api/calibration", body);

  export const predict = (body: PredictRequest) =>
    apiPost<PredictResponse>("/api/v1/predict", body);

  export const transmute = (body: TransmuteRequest) =>
    apiPost<TransmuteResponse>("/api/v1/transmute", body);
}

/**
 * Member 1 – convenience helper for POST /api/v1/transmute
 * Includes lesson_id so backend can link TransmutedContent to a lesson.
 */
export const postTransmute = (
  text: string,
  cognitiveState: neuroApi.CognitiveStateWire,
  lessonId: string | null,
  sessionId?: string,
): Promise<neuroApi.TransmuteResponse> =>
  neuroApi.transmute({
    text,
    cognitive_state: cognitiveState,
    lesson_id: lessonId ?? null,
    session_id: sessionId,
  } as any);
