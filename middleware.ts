import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function validateToken(token: string | undefined) {
  if (!token) return false;

  try {
    // Convert the secret to Uint8Array as required by jose
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET!);
    
    // Verify the token using jose instead of jsonwebtoken
    const { payload } = await jwtVerify(token, secret);
    console.log("Decoded Token:", payload);
    return payload;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

export async function middleware(req: NextRequest) {
  // Skip middleware for login page to prevent redirect loops
  if (req.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname === '/api/login' || req.nextUrl.pathname === '/api/logout'|| req.nextUrl.pathname === '/api/upload-image') { 
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next();
  }
  
  // Skip middleware for static files
  const isStaticFile = /\.(js|css|png|jpg|jpeg|svg|ico|json)$/.test(req.nextUrl.pathname) ||
                      req.nextUrl.pathname.startsWith('/_next/') ||
                      req.nextUrl.pathname.startsWith('/favicon.ico');
  
  if (isStaticFile) {
    return NextResponse.next();
  }

  console.log("Middleware URL:", req.nextUrl.pathname);
  const token = req.cookies.get('token')?.value;
  
  console.log("Middleware Token:", token);

  const isValid = await validateToken(token);
  if (!isValid) {
    console.log("Middleware Token Invalid");
    // Handle differently for API and page requests
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
  console.log("Middleware Token Validated");

  return NextResponse.next();
}

// Update the matcher to be more specific
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    
    // Match all pages except specific ones you want to exclude
    '/((?!login|_next/static|_next/image|favicon.ico).*)',
  ],
};