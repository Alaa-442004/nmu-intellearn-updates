"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateCoursePage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/instructor/dashboard"
        className="inline-flex items-center gap-1 text-sm text-primary mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-2">Create Course Wizard</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        MVP placeholder — full wizard (metadata → modules → content → publish)
        ships in the next sprint.
      </p>
      <div className="rounded-xl border border-dashed border-primary/40 p-8 text-center text-neutral-500">
        Course creation form coming soon. Use admin course moderation once API
        is connected.
      </div>
    </div>
  );
}
