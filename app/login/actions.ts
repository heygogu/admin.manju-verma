
import axios from "axios";

 
export async function Login({ email, password }: { email: string; password: string }) {
    try {
        const apiRes = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/login`, {
            email,
            password
        }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          return { success: true }
    } catch (error) {
      console.error("Server action error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  
