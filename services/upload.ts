/**
 * Upload Service
 * Handles file uploads to the backend
 */

import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { getStoredToken } from "./api";

export interface UploadResponse {
  file_id: string;
  file_url: string;
  file_type: string;
}

/**
 * Upload an image file
 */
export const uploadImage = async (
  imageUri: string
): Promise<UploadResponse> => {
  const token = await getStoredToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  // Create form data
  const formData = new FormData();
  
  // Extract filename from URI
  const filename = imageUri.split("/").pop() || "image.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  // @ts-ignore - FormData append works with file objects
  formData.append("file", {
    uri: imageUri,
    name: filename,
    type: type,
  } as any);

  const url = `${API_BASE_URL}${API_ENDPOINTS.UPLOADS}/image`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type, let the browser set it with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || "Upload failed");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error during upload");
  }
};

