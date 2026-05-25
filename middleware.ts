import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_ROLE } from "@/lib/auth/cookies";
import type { UserRole } from "@/lib/auth/types";

const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/courses",
  "/meeting",
  "/video",
  "/exam-proctoring",
];

const STUDENT_PREFIXES = [
  "/dashboard",
  "/profile",
  "/learn",
  "/certificates",
  "/my-exam",
  "/quiz-login",
  "/exam",
  "/review-result",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/instructor/apply")) return true;
  if (PUBLIC_PREFIXES.some((p) => p !== "/" && pathname.startsWith(p))) {
    return true;
  }
  return false;
}

function isStudentPath(pathname: string): boolean {
  return STUDENT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function homeForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "instructor":
      return "/instructor/dashboard";
    case "student":
      return "/dashboard";
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(AUTH_COOKIE_ROLE)?.value as UserRole | undefined;

  if (pathname === "/instructor/Dashboard") {
    return NextResponse.redirect(new URL("/instructor/dashboard", request.url));
  }

  if (pathname === "/login" || pathname === "/register") {
    if (role) {
      return NextResponse.redirect(new URL(homeForRole(role), request.url));
    }
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/instructor/pending")) {
    if (!role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (!role) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL(homeForRole(role), request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/instructor")) {
    if (role !== "instructor" && role !== "admin") {
      return NextResponse.redirect(new URL(homeForRole(role), request.url));
    }
    return NextResponse.next();
  }

  if (isStudentPath(pathname)) {
    if (role !== "student" && role !== "admin") {
      return NextResponse.redirect(new URL(homeForRole(role), request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
