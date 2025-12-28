/**
 * User Service
 * Handles user-related API calls
 */

import { API_ENDPOINTS } from "@/config/api";
import { apiGet, apiPut } from "./api";
import { User } from "./auth";

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  username?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  avatar_url?: string | null;
  learning_style?: "visual" | "auditory" | "kinesthetic" | "multisensory" | null;
  preferred_subjects?: string[] | null;
  difficulty_level?: "beginner" | "intermediate" | "advanced" | null;
  accessibility_needs?: string[] | null;
  language?: string;
  timezone?: string | null;
}

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  return apiGet<User>(`${API_ENDPOINTS.USERS}/me`);
};

/**
 * Update current user profile
 */
export const updateCurrentUser = async (
  data: UpdateUserRequest
): Promise<User> => {
  return apiPut<User>(`${API_ENDPOINTS.USERS}/me`, data);
};
