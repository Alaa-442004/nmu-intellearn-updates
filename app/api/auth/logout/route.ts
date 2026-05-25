import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_EMAIL,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_ROLE,
} from "@/lib/auth/cookies";

export async function POST() {
  const res = NextResponse.json({ success: true });
  const clear = { maxAge: 0, path: "/" };
  res.cookies.set(AUTH_COOKIE_ROLE, "", clear);
  res.cookies.set(AUTH_COOKIE_EMAIL, "", clear);
  res.cookies.set(AUTH_COOKIE_NAME, "", clear);
  return res;
}
