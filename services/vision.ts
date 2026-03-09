import { Platform } from "react-native";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { getStoredToken } from "@/services/api";

export const analyzeNoteImage = async (uri: string): Promise<string> => {
  const form = new FormData();

  if (Platform.OS === "web") {
    // On web we must send a real Blob/File, not a { uri, type, name } object.
    const response = await fetch(uri);
    const blob = await response.blob();
    form.append("file", blob, "note.jpg");
  } else {
    form.append("file", {
      uri,
      type: "image/jpeg",
      name: "note.jpg",
    } as any);
  }

  const token = await getStoredToken();

  const res = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.VISION_NOTES_ANALYZE}`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Do not set Content-Type here; fetch sets the multipart boundary.
      },
      body: form,
    },
  );

  const textBody = await res.text();

  if (!res.ok) {
    throw new Error(`Vision error (${res.status}): ${textBody}`);
  }

  const data = JSON.parse(textBody) as { text: string };
  return data.text;
};

