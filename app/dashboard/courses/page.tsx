"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, PlayCircle } from "lucide-react";
import { getClientSession } from "@/lib/auth/session";
import {
  getEnrollments,
  getProgressPercent,
} from "@/lib/progress/course-progress";
import { cn } from "@/lib/utils/cn";

export default function MyCoursesPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(getClientSession()?.email ?? "");
  }, []);

  const enrollments = useMemo(
    () => (email ? getEnrollments(email) : []),
    [email]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">My Courses</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        Courses you are enrolled in on the platform.
      </p>

      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-10 text-center">
          <BookOpen className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-500 mb-4">You have not enrolled yet.</p>
          <Link
            href="/courses"
            className="text-primary font-semibold hover:underline"
          >
            Explore catalog
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {enrollments.map((course) => {
            const progress = getProgressPercent(
              course,
              Math.max(course.completedModuleIds.length, 1)
            );
            return (
              <div
                key={course.courseId}
                className={cn(
                  "rounded-xl border border-neutral-200 dark:border-neutral-800",
                  "p-5 bg-card-light dark:bg-card-dark"
                )}
              >
                <h3 className="font-semibold mb-2">{course.courseTitle}</h3>
                <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-3">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Link
                  href={`/learn/${course.courseId}`}
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                >
                  <PlayCircle className="w-4 h-4" />
                  {progress >= 100 ? "Review" : "Continue"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
