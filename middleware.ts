import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

async function validateToken(token: string | undefined) {
  if (!token) return false
  try {
    // Convert the secret to Uint8Array as required by jose
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET!)
    // Verify the token using jose instead of jsonwebtoken
    const { payload } = await jwtVerify(token, secret)
    console.log("Decoded Token:", payload)
    return payload
  } catch (error) {
    console.error("Token validation error:", error)
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip middleware for login page to prevent redirect loops
  if (pathname === "/login") {
    return NextResponse.next()
  }

  // Allow specific API routes without authentication
  const publicApiRoutes = [
    "/api/login",
    "/api/logout",
    "/api/upload-image",
    // Add any other public API routes here
  ]

  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Skip middleware for Next.js internal routes
  if (pathname.startsWith("/_next")) {
    return NextResponse.next()
  }

  // Skip middleware for static files
  const isStaticFile =
    /\.(js|css|png|jpg|jpeg|svg|ico|json|woff|woff2|ttf|eot)$/.test(pathname) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/")

  if (isStaticFile) {
    return NextResponse.next()
  }

  console.log("Middleware URL:", pathname)
  const token = req.cookies.get("token")?.value
  console.log("Middleware Token:", token)

  const isValid = await validateToken(token)

  // Redirect authenticated users from root to dashboard
  if (pathname === "/" && isValid) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Handle API routes that require authentication
  if (pathname.startsWith("/api/")) {
    if (!isValid) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    // Allow authenticated API requests to continue
    return NextResponse.next()
  }

  // Handle page routes that require authentication
  if (!isValid) {
    console.log("Middleware Token Invalid")
    return NextResponse.redirect(new URL("/login", req.url))
  }

  console.log("Middleware Token Validated")
  return NextResponse.next()
}

// Update the matcher to be more specific
export const config = {
  matcher: [
    // Match all pages and API routes except specific ones you want to exclude
    "/((?!login|_next/static|_next/image|favicon.ico).*)",
  ],
}
