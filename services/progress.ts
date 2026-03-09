import { API_ENDPOINTS } from "@/config/api";
import { apiGet } from "./api";

export interface UserProgressResponse {
  total_lessons_created: number;
  lessons_in_progress: number;
  lessons_completed: number;
  avg_lesson_progress: number;
  total_quizzes_taken: number;
  avg_quiz_score: number;
  last_quiz_score?: number | null;
  last_quiz_date?: string | null;
  last_active_date?: string | null;
}

/**
 * Fetch the current user's progress summary.
 * GET /api/progress/me
 */
export const getUserProgress = async (): Promise<UserProgressResponse> => {
  const endpoint = `${API_ENDPOINTS.PROGRESS}/me`;
  return apiGet<UserProgressResponse>(endpoint);
};

