/**
 * Firebase Storage Service
 * Handles image uploads to Firebase Storage
 */

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/config/firebase";
import { Platform } from "react-native";

/**
 * Convert a file URI to a Blob (works with Expo file URIs)
 */

const uriToBlob = async (uri: string): Promise<Blob> => {
  // Decode URI in case it has encoded characters
  const decodedUri = decodeURI(uri);

  // Try fetch first (works on web with blob: URLs and on native with some URL types)
  try {
    const response = await fetch(decodedUri);
    if (response.ok) {
      let blob = await response.blob();
      // Force image/jpeg type for avatar uploads (ensures Firebase rule match)
      blob = new Blob([blob], { type: "image/jpeg" });
      return blob;
    }
  } catch (fetchError) {
    // Fetch failed, will try XMLHttpRequest below
    console.log("Fetch failed, trying XMLHttpRequest:", fetchError);
  }

  // For React Native file:// URIs, use XMLHttpRequest
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status === 200 || xhr.status === 0) {
        let blob = xhr.response as Blob;
        // Force image/jpeg type for avatar uploads (ensures Firebase rule match)
        blob = new Blob([blob], { type: "image/jpeg" });
        resolve(blob);
      } else {
        reject(new Error(`Failed to load file: ${xhr.statusText}`));
      }
    };
    xhr.onerror = function () {
      reject(new Error("Failed to convert URI to Blob. Please try again."));
    };
    xhr.responseType = "blob";
    xhr.open("GET", decodedUri, true);
    xhr.send(null);
  });
};

/**
 * Upload an image to Firebase Storage
 * @param imageUri - Local URI of the image to upload
 * @param userId - User ID to organize files
 * @param folder - Folder path in storage (e.g., "avatars", "lessons")
 * @returns Promise with the download URL
 */
export const uploadImageToFirebase = async (
  imageUri: string,
  userId: string,
  folder: string = "avatars"
): Promise<string> => {
  try {
    // Convert file URI to Blob (works with React Native)
    const blob = await uriToBlob(imageUri);

    // Create a unique filename (nested structure: folder/userId/filename)
    const timestamp = Date.now();
    const filename = `${timestamp}.jpg`;
    const storagePath = `${folder}/${userId}/${filename}`;

    // Create a reference to the file location
    const storageRef = ref(storage, storagePath);

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Wait for upload to complete
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress tracking (optional)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        () => {
          resolve();
        }
      );
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    console.error("Firebase upload error:", error);
    console.error("Error code:", error?.code);
    console.error("Error message:", error?.message);
    console.error("Error details:", error);

    // Provide more helpful error messages
    let errorMessage = "Failed to upload image to Firebase Storage";
    if (error?.code === "storage/unauthorized") {
      errorMessage = "Upload denied. Check Firebase Storage security rules.";
    } else if (error?.code === "storage/canceled") {
      errorMessage = "Upload was canceled.";
    } else if (error?.code === "storage/unknown") {
      errorMessage =
        "Unknown error. Check Firebase configuration and security rules.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Upload user avatar to Firebase Storage
 * @param imageUri - Local URI of the avatar image
 * @param userId - User ID
 * @returns Promise with the download URL
 */
export const uploadAvatar = async (
  imageUri: string,
  userId: string
): Promise<string> => {
  return uploadImageToFirebase(imageUri, userId, "avatars");
};
