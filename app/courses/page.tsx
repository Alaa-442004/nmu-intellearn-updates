"use client";

import { Navbar } from "@/components/navigation/navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/config/api";
import { fetchJson } from "@/lib/api/client";
import { CoursesResponseSchema } from "@/lib/api/contracts";

type Course = {
  id: number;
  title: string;
  description: string;
  duration: string;
  students: number;
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = CoursesResponseSchema.parse(
          await fetchJson<unknown>(apiUrl("courses.php"))
        );
        if (data.success) {
          setCourses(data.courses || []);
        } else {
          setError(data.error || "Failed to load courses.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to reach courses API.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">All Courses</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore our comprehensive course catalog
            </p>
          </div>

          {loading && (
            <p className="text-gray-600 dark:text-gray-300">Loading courses...</p>
          )}

          {error && !loading && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">
              {error}
            </p>
          )}

          {!loading && !error && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "bg-card-light dark:bg-card-dark rounded-xl overflow-hidden",
                    "border border-gray-200 dark:border-gray-700",
                    "shadow-lg hover:shadow-xl transition-shadow"
                  )}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          course.level === "Beginner"
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : course.level === "Intermediate"
                            ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                        )}
                      >
                        {course.level}
                      </span>
                      <span className="text-sm font-semibold">
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                      <span>{course.duration}</span>
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    <Link
                      href={`/courses/${course.id}`}
                      className={cn(
                        "w-full inline-flex items-center justify-center",
                        "px-4 py-2 bg-primary text-white rounded-lg",
                        "hover:bg-primary-dark transition-colors",
                        "font-semibold"
                      )}
                    >
                      View Course
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
