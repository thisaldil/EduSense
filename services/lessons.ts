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

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: QuizAnswer[];
  score: number;
  correct_count: number;
  total_questions: number;
  completed_at: string;
  cognitive_load?: "Low" | "Medium" | "High";
  cognitive_load_confidence?: number;
}

export interface QuizResults {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  completed_at: string;
  cognitive_load?: "Low" | "Medium" | "High";
  cognitive_load_confidence?: number;
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
