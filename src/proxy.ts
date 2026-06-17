import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If authenticated but not onboarded → redirect to onboarding (except if already there)
    if (token && !token.onboarded && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // If authenticated and onboarded → redirect away from onboarding
    if (token && token.onboarded && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Allow public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon") ||
          pathname.includes(".")
        ) {
          return true;
        }
        // Require auth for platform routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
