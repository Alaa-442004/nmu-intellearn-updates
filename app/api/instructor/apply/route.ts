import { NextResponse } from "next/server";
import { z } from "zod";
import { createApplication } from "@/lib/data/instructor-applications";

const ApplySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  specialty: z.string().min(2),
  bio: z.string().min(20),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const body = ApplySchema.parse(await request.json());
    const app = await createApplication({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: body.password.trim(),
      specialty: body.specialty.trim(),
      bio: body.bio.trim(),
      portfolioUrl: body.portfolioUrl?.trim() || undefined,
    });

    return NextResponse.json({ success: true, application: app });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? "Please fill all required fields correctly."
        : err instanceof Error
          ? err.message
          : "Application failed.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
