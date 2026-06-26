import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes accessible without authentication
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/agendar"];

// Routes requiring authentication but NOT a barbershop (onboarding flow)
const ONBOARDING_ROUTES = ["/onboarding"];

// All auth routes (redirect to dashboard if already logged in)
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Firebase auth session cookie
  const sessionCookie =
    request.cookies.get("__session")?.value ||
    request.cookies.get("firebase-auth-token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isOnboardingRoute = ONBOARDING_ROUTES.some((route) => pathname.startsWith(route));

  // If authenticated user tries to access login/register, redirect to dashboard
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow onboarding route for authenticated users (barbershopId check is done client-side)
  if (isOnboardingRoute && sessionCookie) {
    return NextResponse.next();
  }

  // If unauthenticated user tries to access protected routes, redirect to login
  if (!isPublicRoute && !isOnboardingRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.ico|.*\\.json|.*\\.js|.*\\.html).*)",
  ],
};
