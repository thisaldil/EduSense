/**
 * Authentication Service
 * Handles authentication-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiPost, storeToken, removeStoredToken } from './api';

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string; // ISO date string (YYYY-MM-DD)
  gender: 'male' | 'female' | 'other';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  avatar_url: string | null;
  learning_style: string | null;
  preferred_subjects: string[] | null;
  difficulty_level: string | null;
  accessibility_needs: string[] | null;
  language: string;
  parental_consent: boolean;
  consent_date: string | null;
  timezone: string | null;
  email_verified: boolean;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  profile: any | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/**
 * Register a new user
 */
export const register = async (
  data: RegisterRequest
): Promise<LoginResponse> => {
  const response = await apiPost<LoginResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    data
  );
  
  // Store the access token
  if (response.access_token) {
    await storeToken(response.access_token);
  }
  
  return response;
};

/**
 * Login with email and password
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiPost<LoginResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    data
  );
  
  // Store the access token
  if (response.access_token) {
    await storeToken(response.access_token);
  }
  
  return response;
};

/**
 * Logout (remove token from storage)
 */
export const logout = async (): Promise<void> => {
  try {
    // Optionally call the logout endpoint if your backend supports it
    // await apiPost(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    // Ignore errors on logout endpoint
  }
  
  // Always remove the token from storage
  await removeStoredToken();
};

/**
 * Helper function to split a full name into first and last name
 */
export const splitName = (fullName: string): { first_name: string; last_name: string } => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { first_name: '', last_name: '' };
  }
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: '' };
  }
  const first_name = parts[0];
  const last_name = parts.slice(1).join(' ');
  return { first_name, last_name };
};

/**
 * Generate username from email
 */
export const generateUsernameFromEmail = (email: string): string => {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
};

