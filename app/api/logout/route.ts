import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const response = NextResponse.json(
            { success: true, message: "Logout successful" },
            { status: 200 }
        );

        // Manually remove the cookie by setting an expired Set-Cookie header
        response.headers.set(
            "Set-Cookie",
            "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure"
        );

        return response;
    } catch (error) {
        console.error("Error logging out:", error);
        return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
    }
}
