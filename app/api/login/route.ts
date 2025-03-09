import connectToDatabase from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const username = process.env.NEXT_PUBLIC_USERNAME!;
const passcode = process.env.NEXT_PUBLIC_PASSWORD!;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  console.log(email, password);
  
  try {
    await connectToDatabase(); // Connect to MongoDB
    
    if (email !== username || password !== passcode) {
      return NextResponse.json({ error: "Invalid Credentials" }, { status: 401 });
    }

    const token = jwt.sign({ email }, process.env.NEXT_PUBLIC_JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Create a response with success message
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );

    // Set the cookie on the response
    response.cookies.set("token", token, {
      httpOnly: true,
      
      sameSite: "lax", // Changed from "none" to "lax" for better compatibility
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}