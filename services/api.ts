/**
 * API Client
 * Handles all HTTP requests to the backend
 */

import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

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
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error reading token:", error);
    return null;
  }
};

/**
 * Store authentication token
 */
export const storeToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing token:", error);
    throw error;
  }
};

/**
 * Remove stored authentication token
 */
export const removeStoredToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

/**
 * Make an API request with authentication
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getStoredToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
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

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.detail || data.message || "An error occurred",
        status: response.status,
        errors: data.errors,
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
