import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AUTH_COOKIE_EMAIL,
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_ROLE,
} from "@/lib/auth/cookies";
import { findDemoUser } from "@/lib/auth/demo-users";
import {
  findApplicationByEmail,
  findApprovedInstructor,
} from "@/lib/data/instructor-applications";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function sessionResponse(
  user: { email: string; name: string; role: string },
  extra?: { redirect?: string; pending?: boolean }
) {
  const res = NextResponse.json({
    success: true,
    user: { email: user.email, name: user.name, role: user.role },
    ...extra,
  });

  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  };

  res.cookies.set(AUTH_COOKIE_ROLE, user.role, opts);
  res.cookies.set(AUTH_COOKIE_EMAIL, user.email, opts);
  res.cookies.set(AUTH_COOKIE_NAME, user.name, opts);

  return res;
}

export async function POST(request: Request) {
  try {
    const body = LoginSchema.parse(await request.json());
    const email = body.email.trim().toLowerCase();
    const password = body.password.trim();

    const demo = findDemoUser(email, password);
    if (demo) {
      return sessionResponse({
        email: demo.email,
        name: demo.name,
        role: demo.role,
      });
    }

    const approved = await findApprovedInstructor(email, password);
    if (approved) {
      return sessionResponse({
        email: approved.email,
        name: approved.name,
        role: "instructor",
      });
    }

    const pending = await findApplicationByEmail(email);
    if (pending && pending.password === password) {
      if (pending.status === "pending") {
        return NextResponse.json({
          success: false,
          pending: true,
          message:
            "Your instructor application is pending admin approval.",
        });
      }
      if (pending.status === "rejected") {
        return NextResponse.json({
          success: false,
          message: "Your instructor application was not approved.",
        });
      }
    }

    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 }
    );
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? "Invalid login data."
        : err instanceof Error
          ? err.message
          : "Login failed.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
