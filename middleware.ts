import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the path
  const path = request.nextUrl.pathname;
  
  // If it's not an admin path, allow the request
  if (!path.startsWith("/admin")) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated
  const token = await getToken({ 
    req: request,
    secret: "0fe5cc997d27b0d8b06ab27667d7a7e1"
  });
  
  // If not authenticated and trying to access admin, redirect to login
  if (!token) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // User is authenticated, allow access to admin
  return NextResponse.next();
}

// Specify the paths this middleware should run on
export const config = {
  matcher: ["/admin/:path*"],
}; 