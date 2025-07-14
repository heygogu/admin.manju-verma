"use server"

import axios from "axios"
import { revalidatePath } from "next/cache"

export async function getBlogPost(id: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/crud/${id}`, {
            method: "GET",
            cache: "no-store",
        })
        console.log("Serverrrr", response)
        if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.message || "Failed to fetch blog post" }
        }

        const data = await response.json()
        return { success: true, data: data.data }
    } catch (error) {
        console.error("Error fetching blog post:", error)
        return { success: false, error: "Failed to fetch blog post" }
    }
}

export async function updateBlog(id: string, payload: any) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/crud/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorData = await response.json()
            return { success: false, error: errorData.message || "Failed to update blog" }
        }

        const data = await response.json()
        revalidatePath("/blogs")
        return { success: true, data: data.data }
    } catch (error) {
        console.error("Error updating blog:", error)
        return { success: false, error: "Failed to update blog" }
    }
}


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