import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies or localStorage (stored in cookie)
  const token = request.cookies.get("token")?.value;

  // PROTECTED ROUTES - Need authentication

  const protectedRoutes = [
    "/dashboard",
    "/dashboard/content",
    "/dashboard/chat",
    "/dashboard/settings",
  ];

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // If no token and trying to access protected route
  if (isProtectedRoute && !token) {
    // Redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // AUTH ROUTES - Should NOT access if logged in

  const authRoutes = ["/login", "/signup"];

  // Check if current route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If logged in and trying to access login/signup
  if (isAuthRoute && token) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // PUBLIC ROUTES - Everyone can access

  // Routes like / (home), /about, /brain/[shareLink]
  // Don't need to do anything, just continue

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    // Apply to all routes except static files, public folder, etc
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
