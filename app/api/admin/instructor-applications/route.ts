import { NextResponse } from "next/server";
import { z } from "zod";
import {
  listApplications,
  updateApplicationStatus,
} from "@/lib/data/instructor-applications";

export async function GET() {
  const applications = await listApplications();
  return NextResponse.json({ success: true, applications });
}

const PatchSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(request: Request) {
  try {
    const body = PatchSchema.parse(await request.json());
    const updated = await updateApplicationStatus(body.id, body.status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Application not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, application: updated });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? "Invalid request."
        : err instanceof Error
          ? err.message
          : "Update failed.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
