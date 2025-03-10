import axios from "axios";

export async function uploadImage({ formData }: { formData: FormData }) {
  try {
    const response = await axios.post(`/api/upload-image`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createBlog(payload: any) {
  try {
    const response = await axios.post(`/api/blog/create`, payload, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: error?.response?.body?.message,
    };
  }
}
