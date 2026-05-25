"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getClientSession } from "@/lib/auth/session";
import {
  getEnrollments,
  getProgressPercent,
  getContinueTarget,
} from "@/lib/progress/course-progress";
import { apiUrl } from "@/lib/config/api";
import { fetchJson } from "@/lib/api/client";
import { CoursesResponseSchema } from "@/lib/api/contracts";

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [courseModules, setCourseModules] = useState<
    Record<number, number[]>
  >({});

  useEffect(() => {
    setEmail(getClientSession()?.email ?? "");
  }, []);

  const enrollments = useMemo(
    () => (email ? getEnrollments(email) : []),
    [email]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = CoursesResponseSchema.parse(
          await fetchJson<unknown>(apiUrl("courses.php"))
        );
        if (!data.success || !data.courses) return;
        const map: Record<number, number[]> = {};
        for (const c of data.courses) {
          const detail = await fetchJson<unknown>(
            `${apiUrl("courses.php")}?id=${c.id}`
          );
          const mods =
            (detail as { course?: { modules?: { id: number }[] } }).course
              ?.modules ?? [];
          map[c.id] = mods.map((m) => m.id);
        }
        setCourseModules(map);
      } catch {
        /* catalog optional for continue CTA */
      }
    };
    load();
  }, []);

  const continueCourse = enrollments
    .map((e) => {
      const moduleIds = courseModules[e.courseId] ?? [];
      const target = getContinueTarget(e, moduleIds);
      const percent = getProgressPercent(e, moduleIds.length || 1);
      return { ...e, target, percent, moduleIds };
    })
    .filter((e) => e.percent < 100)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        Welcome back! Here&apos;s your learning overview
      </p>

      {continueCourse && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary mb-1">
                Continue learning
              </p>
              <h2 className="text-xl font-bold">{continueCourse.courseTitle}</h2>
              <p className="text-sm text-neutral-500 mt-1">
                {continueCourse.percent}% complete
              </p>
            </div>
            <Link
              href={`/learn/${continueCourse.courseId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              <PlayCircle className="w-5 h-5" />
              Resume
            </Link>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Enrolled Courses",
            value: String(enrollments.length),
            icon: BookOpen,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
          },
          {
            title: "Certificates",
            value: String(
              enrollments.filter((e) => {
                const total = courseModules[e.courseId]?.length ?? 0;
                return total > 0 && getProgressPercent(e, total) === 100;
              }).length
            ),
            icon: Award,
            color: "text-accent",
            bgColor: "bg-accent/10",
          },
          {
            title: "Upcoming Exams",
            value: "3",
            icon: Calendar,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            title: "Learning streak",
            value: "5 days",
            icon: TrendingUp,
            color: "text-success",
            bgColor: "bg-success/10",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={cn(
              "rounded-xl p-6 border border-neutral-200 dark:border-neutral-800",
              "bg-card-light dark:bg-card-dark shadow-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  stat.bgColor
                )}
              >
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 bg-card-light dark:bg-card-dark"
      >
        <h2 className="text-xl font-semibold mb-4">Course Progress</h2>
        {enrollments.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            No enrollments yet.{" "}
            <Link href="/courses" className="text-primary hover:underline">
              Browse courses
            </Link>{" "}
            to start learning.
          </p>
        ) : (
          <div className="space-y-4">
            {enrollments.map((course) => {
              const total = courseModules[course.courseId]?.length ?? 1;
              const progress = getProgressPercent(course, total);
              return (
                <div key={course.courseId}>
                  <div className="flex justify-between mb-2">
                    <Link
                      href={`/learn/${course.courseId}`}
                      className="font-medium hover:text-primary"
                    >
                      {course.courseTitle}
                    </Link>
                    <span className="text-sm text-neutral-500">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/dashboard/courses"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          <BookOpen className="w-4 h-4" />
          My courses
        </Link>
        <Link
          href="/my-exam"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          <Clock className="w-4 h-4" />
          My exams
        </Link>
      </div>
    </div>
  );
}
