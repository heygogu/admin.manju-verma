// "use server"; 
export async function uploadImage({ formData }: { formData: FormData }) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload-image`, {
        method: "POST",
        body: formData, // ✅ No need for Content-Type, fetch handles it automatically
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      return { success: true, data: await response.json() };
    } catch (error) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  

 export async function createBlog(payload:any){
    // title, excerpt, content, coverImage, author, status, tags
    try {
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      return { success: true };
    } catch (error) {
      console.error('Server action error:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
 }
  