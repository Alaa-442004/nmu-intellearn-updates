"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Play,
  Trophy,
} from "lucide-react";
import { apiUrl } from "@/lib/config/api";
import { fetchJson } from "@/lib/api/client";
import { CourseDetailResponseSchema } from "@/lib/api/contracts";
import { getClientSession } from "@/lib/auth/session";
import {
  enrollCourse,
  getCourseProgress,
  getProgressPercent,
  markModuleComplete,
} from "@/lib/progress/course-progress";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

export default function LearnPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const [course, setCourse] = useState<{
    id: number;
    title: string;
    instructor: string;
    modules: { id: number; title: string; duration: string | null }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [progressTick, setProgressTick] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(getClientSession()?.email ?? "");
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = CourseDetailResponseSchema.parse(
          await fetchJson<unknown>(
            `${apiUrl("courses.php")}?id=${encodeURIComponent(String(courseId))}`
          )
        );
        if (data.success && data.course) {
          setCourse(data.course);
          if (email) {
            enrollCourse(email, data.course.id, data.course.title);
          }
          const first = data.course.modules[0]?.id ?? null;
          setActiveModuleId(first);
        } else {
          setError(data.error || "Course not found.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load course."
        );
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isNaN(courseId)) load();
  }, [courseId, email]);

  const progress = useMemo(() => {
    if (!email || !course) return null;
    return getCourseProgress(email, course.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, course, progressTick]);

  const percent = useMemo(() => {
    if (!progress || !course) return 0;
    return getProgressPercent(progress, course.modules.length);
  }, [progress, course]);

  const activeModule = course?.modules.find((m) => m.id === activeModuleId);

  const handleMarkComplete = () => {
    if (!email || !course || !activeModuleId) return;
    markModuleComplete(email, course.id, activeModuleId);
    setProgressTick((t) => t + 1);
    const ids = course.modules.map((m) => m.id);
    const idx = ids.indexOf(activeModuleId);
    if (idx < ids.length - 1) {
      setActiveModuleId(ids[idx + 1]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6 rounded-xl border border-error/30 bg-error/10 text-error text-center">
        {error ?? "Course unavailable"}
        <div className="mt-4">
          <Link href="/courses" className="text-primary hover:underline">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const isComplete = (id: number) =>
    progress?.completedModuleIds.includes(id) ?? false;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-card-light dark:bg-card-dark p-6">
          <h2 className="text-xl font-bold mb-1">{course.title}</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Instructor: {course.instructor}
          </p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall progress</span>
              <span className="font-semibold text-primary">{percent}%</span>
            </div>
            <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {percent === 100 && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/10 text-primary mb-4">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">
                Course completed! View your{" "}
                <Link href="/certificates" className="underline">
                  certificate
                </Link>
                .
              </span>
            </div>
          )}

          <div className="aspect-video bg-neutral-900 rounded-lg flex items-center justify-center mb-4">
            <Play className="w-16 h-16 text-white/80" />
          </div>

          <h3 className="text-lg font-semibold mb-2">
            {activeModule?.title ?? "Select a lesson"}
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            {activeModule?.duration
              ? `Duration: ${activeModule.duration}`
              : "Self-paced lesson"}
          </p>

          <p className="text-neutral-600 dark:text-neutral-300 mb-6">
            Watch the lesson, then mark it complete to unlock progress tracking
            and move to the next module.
          </p>

          <Button
            onClick={handleMarkComplete}
            disabled={!activeModuleId || isComplete(activeModuleId)}
            className="w-full sm:w-auto"
          >
            {activeModuleId && isComplete(activeModuleId)
              ? "Lesson completed"
              : "Mark lesson complete"}
          </Button>
        </div>
      </div>

      <aside className="space-y-3">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-neutral-500">
          Course content
        </h3>
        {course.modules.map((module, index) => {
          const done = isComplete(module.id);
          const active = module.id === activeModuleId;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => setActiveModuleId(module.id)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-primary/40"
              )}
            >
              <div className="flex items-start gap-3">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs text-neutral-500 mb-1">
                    Lesson {index + 1}
                  </p>
                  <p className="font-medium text-sm">{module.title}</p>
                </div>
              </div>
            </button>
          );
        })}
      </aside>
    </div>
  );
}
