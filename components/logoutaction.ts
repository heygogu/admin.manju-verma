
import axios from "axios";

export async function LogoutAction() {
  try {
    const response= await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/logout`);
    console.log(response);
   
    return {success:true}
  } catch (error) {
    return {success:false}
  }
}