/**
 * Lessons Service
 * Handles lesson-related API calls
 */

import { API_ENDPOINTS } from "@/config/api";
import { apiGet, apiPost } from "./api";

export interface CreateLessonRequest {
  title: string;
  subject: string;
  content: string;
}

export interface Lesson {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  content: string;
  concepts: any[];
  visuals: any[];
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  type: "multiple" | "truefalse";
  question: string;
  options: string[];
  correct_index?: number; // Only included when generating, not when student views
}

export interface Quiz {
  id: string;
  lesson_id: string;
  user_id: string;
  questions: Question[];
  created_at: string;
}

export interface GenerateQuizRequest {
  lesson_id: string;
}

export interface QuizAnswer {
  question_id: string;
  answer_index: number;
}

export interface CognitiveLoadFeatures {
  answerChanges: number;
  currentErrorStreak: number;
  totalScore: number;
  accuracyRate: number;
  errors: number;
  idleGapsOverThreshold: number;
  responseTimeVariability: number;
  completionTime: number;
  avgResponseTime: number;
}

export interface SubmitQuizRequest {
  answers: QuizAnswer[];
  cognitive_load_features?: CognitiveLoadFeatures;
}

/** Cognitive load prediction from backend (e.g. { "Low": 0.05, "Medium": 0.2, "High": 0.75 }) */
export interface CognitiveLoadScores {
  Low?: number;
  Medium?: number;
  High?: number;
}

/** Backend may return cognitive_load as string or numeric class (0=Low, 1=Medium, 2=High) */
export interface QuizSubmission {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: QuizAnswer[];
  score: number;
  correct_count: number;
  total_questions: number;
  completed_at: string;
  cognitive_load?: "Low" | "Medium" | "High" | number;
  cognitive_load_confidence?: number;
  cognitive_load_scores?: CognitiveLoadScores;
}

/** Backend may return cognitive_load as string ("Low"/"Medium"/"High") or numeric class (0=Low, 1=Medium, 2=High) */
export interface QuizResults {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  completed_at: string;
  cognitive_load?: "Low" | "Medium" | "High" | number;
  cognitive_load_confidence?: number;
  cognitive_load_scores?: CognitiveLoadScores;
}

/**
 * Create a new lesson
 */
export const createLesson = async (
  data: CreateLessonRequest
): Promise<Lesson> => {
  return apiPost<Lesson>(API_ENDPOINTS.LESSONS, data);
};

/**
 * Get a lesson by ID
 */
export const getLesson = async (lessonId: string): Promise<Lesson> => {
  return apiGet<Lesson>(`${API_ENDPOINTS.LESSONS}/${lessonId}`);
};

/**
 * Generate quiz from a lesson
 */
export const generateQuiz = async (
  data: GenerateQuizRequest
): Promise<Quiz> => {
  return apiPost<Quiz>(`${API_ENDPOINTS.QUIZZES}/generate`, data);
};

/**
 * Get quiz by ID (student view - without correct_index)
 */
export const getQuiz = async (quizId: string): Promise<Quiz> => {
  return apiGet<Quiz>(`${API_ENDPOINTS.QUIZZES}/${quizId}`);
};

/**
 * Submit quiz answers
 */
export const submitQuiz = async (
  quizId: string,
  data: SubmitQuizRequest
): Promise<QuizSubmission> => {
  return apiPost<QuizSubmission>(
    `${API_ENDPOINTS.QUIZZES}/${quizId}/submit`,
    data
  );
};

/**
 * Get quiz results
 */
export const getQuizResults = async (quizId: string): Promise<QuizResults> => {
  return apiGet<QuizResults>(`${API_ENDPOINTS.QUIZZES}/${quizId}/results`);
};

/**
 * Validate a single quiz answer (for immediate feedback)
 * This endpoint may not exist in the backend - it's a proposed addition
 */
export const validateQuizAnswer = async (
  quizId: string,
  questionId: string,
  answerIndex: number
): Promise<{ correct_index: number; is_correct: boolean }> => {
  return apiPost<{ correct_index: number; is_correct: boolean }>(
    `${API_ENDPOINTS.QUIZZES}/${quizId}/validate-answer`,
    {
      question_id: questionId,
      answer_index: answerIndex,
    }
  );
};

/** Optional filters for GET /api/activities */
export interface GetActivitiesParams {
  topic?: string;
  cognitive_load?: "LOW" | "MEDIUM" | "HIGH";
  activity_type?: "TRUE_FALSE" | "MCQ" | "MATCHING" | "FILL_BLANK_WORD_BANK";
}

/** Optional filters for GET /api/lessons/:lessonId/activities (topic inferred by backend from lesson, or pass topic to filter) */
export interface GetLessonActivitiesParams {
  topic?: string;
  cognitive_load?: "LOW" | "MEDIUM" | "HIGH";
  activity_type?: "TRUE_FALSE" | "MCQ" | "MATCHING" | "FILL_BLANK_WORD_BANK";
}

/** Activity type returned by GET /api/activities (re-export from types in app) */
export type { Activity } from "@/types/activities";

/**
 * Get activities for a lesson (backend infers topic from lesson; requires auth).
 * GET /api/lessons/{lessonId}/activities
 */
export const getLessonActivities = async (
  lessonId: string,
  params?: GetLessonActivitiesParams
): Promise<import("@/types/activities").Activity[]> => {
  const base = `${API_ENDPOINTS.LESSONS}/${lessonId}/activities`;
  if (!params || (params.cognitive_load == null && params.activity_type == null && params.topic == null)) {
    return apiGet<import("@/types/activities").Activity[]>(base);
  }
  const search = new URLSearchParams();
  if (params.topic) search.set("topic", params.topic);
  if (params.cognitive_load) search.set("cognitive_load", params.cognitive_load);
  if (params.activity_type) search.set("activity_type", params.activity_type);
  const endpoint = `${base}?${search.toString()}`;
  return apiGet<import("@/types/activities").Activity[]>(endpoint);
};

/**
 * Get all activities (no lesson). GET /api/activities
 * Query params are optional; omit to get all activities.
 */
export const getActivities = async (
  params?: GetActivitiesParams
): Promise<import("@/types/activities").Activity[]> => {
  const base = API_ENDPOINTS.ACTIVITIES;
  if (!params || Object.keys(params).length === 0) {
    return apiGet<import("@/types/activities").Activity[]>(base);
  }
  const search = new URLSearchParams();
  if (params.topic) search.set("topic", params.topic);
  if (params.cognitive_load) search.set("cognitive_load", params.cognitive_load);
  if (params.activity_type) search.set("activity_type", params.activity_type);
  const endpoint = `${base}?${search.toString()}`;
  return apiGet<import("@/types/activities").Activity[]>(endpoint);
};

/**
 * TransmutedContent document from backend (Member 1).
 * Matches GET /api/content/transmuted/latest response.
 */
export interface TransmutedContentDoc {
  _id: string;
  lesson_id: string | null;
  student_id: string | null;
  session_id: string | null;
  topic: string;
  lesson_title: string;
  input: {
    raw_text: string;
    cognitive_state: "OVERLOAD" | "OPTIMAL" | "LOW_LOAD";
  };
  nlp_analysis: Record<string, any>;
  output: {
    tier_applied: string;
    transmuted_text: string;
    keywords_preserved: string[];
    keywords_dropped: string[];
    [key: string]: any;
  };
  quality: Record<string, any>;
  created_at: string;
}

/**
 * Fetch the latest transmuted content for a given lesson + student.
 * GET /api/content/transmuted/latest?lesson_id=...&student_id=...
 *
 * Returns:
 * - TransmutedContentDoc on 200
 * - null on 404 (no content yet)
 */
export const getLatestTransmutedContent = async (
  studentId: string,
  lessonId?: string,
): Promise<TransmutedContentDoc | null> => {
  const search = new URLSearchParams();
  search.set("student_id", studentId);
  if (lessonId) search.set("lesson_id", lessonId);

  const endpoint = `${API_ENDPOINTS.CONTENT}/transmuted/latest?${search.toString()}`;

  try {
    return await apiGet<TransmutedContentDoc>(endpoint);
  } catch (err: any) {
    if (err?.status === 404) {
      return null;
    }
    throw err;
  }
};
