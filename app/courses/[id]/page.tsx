"use client";

import { Navbar } from "@/components/navigation/navbar";
import { motion } from "framer-motion";
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Play, 
  Download, 
  Share2, 
  Loader2,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";
import { getClientSession } from "@/lib/auth/session";
import { enrollCourse } from "@/lib/progress/course-progress";
import { apiUrl } from "@/lib/config/api";
import { fetchJson } from "@/lib/api/client";
import { CourseDetailResponseSchema } from "@/lib/api/contracts";
import { saveAs } from "file-saver";

// Extracted types matching the utility
import type { CourseDetail } from "@/lib/pdf/generateCoursePDF";

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = CourseDetailResponseSchema.parse(
          await fetchJson<unknown>(
            `${apiUrl("courses.php")}?id=${encodeURIComponent(params.id)}`
          )
        );
        if (data.success && data.course) {
          setCourse(data.course as CourseDetail);
        } else {
          setError(data.error || "Course not found.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to reach course details API."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  // --- Feature: PDF Generation ---
  const handleDownloadPDF = async () => {
    if (!course) return;
    setIsGeneratingPDF(true);
    
    try {
      // Dynamically import to prevent Next.js SSR crashes with Node streams
      const { generateCoursePDF } = await import("@/lib/pdf/generateCoursePDF");
      const pdfBlob = await generateCoursePDF(course);
      
      const fileName = `${course.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-overview.pdf`;
      saveAs(pdfBlob, fileName);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate the PDF file. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // --- Feature: Share Course ---
  const handleShare = async () => {
    if (!course) return;
    const url = window.location.href;
    const shareData = {
      title: course.title,
      text: `Check out this amazing course: ${course.title} by ${course.instructor}`,
      url: url,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Share was canceled or failed", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setShareFeedback("Link copied to clipboard!");
        setTimeout(() => setShareFeedback(null), 3000);
      } catch (err) {
        alert("Failed to copy link.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading course details...</span>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {!loading && !error && course && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <span
                className={cn(
                  "inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4",
                  course.level === "Beginner"
                    ? "bg-green-500/20 text-green-600 dark:text-green-400"
                    : course.level === "Intermediate"
                    ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                )}
              >
                {course.level}
              </span>
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{course.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  {course.duration ?? "Self-paced"}
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {course.students.toLocaleString()} students
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-accent text-accent mr-2" />
                  {course.rating.toFixed(1)}
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Instructor: {course.instructor}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-6"
                >
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">About This Course</h2>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {course.longDescription || course.description}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
                >
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Course Modules</h2>
                  {course.modules.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                      Modules will be available soon.
                    </p>
                  )}
                  <div className="space-y-4">
                    {course.modules.map((module) => (
                      <Link
                        key={module.id}
                        href={module.videoUrl || "/video"}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                          "bg-background-light dark:bg-background-dark border-gray-200 dark:border-gray-700 hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center flex-1">
                          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full mr-4 shrink-0" />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                            {module.duration && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {module.duration}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {module.examUrl && (
  <span title="Contains Exam">
    <FileText className="w-4 h-4 text-gray-400" />
  </span>
)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Actions Widget */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg sticky top-24"
                >
                  <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-primary mb-2">
                      Ready to dive in?
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const session = getClientSession();
                        if (!session) {
                          router.push(`/login?from=/courses/${params.id}`);
                          return;
                        }
                        enrollCourse(
                          session.email,
                          course.id,
                          course.title
                        );
                        router.push(`/learn/${course.id}`);
                      }}
                      className={cn(
                        "w-full flex items-center justify-center px-6 py-3",
                        "bg-primary text-white rounded-lg font-semibold",
                        "hover:bg-primary-dark transition-colors"
                      )}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Enroll & Start Learning
                    </button>

                    <Link
                      href={`/exam/${course.id}`}
                      className={cn(
                        "w-full flex items-center justify-center px-6 py-3",
                        "border border-primary text-primary rounded-lg font-semibold",
                        "hover:bg-primary/10 transition-colors"
                      )}
                    >
                      Start Quiz
                    </Link>

                    <button
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPDF}
                      className={cn(
                        "w-full flex items-center justify-center px-6 py-3",
                        "border border-gray-300 dark:border-gray-600 rounded-lg font-semibold",
                        "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      )}
                    >
                      {isGeneratingPDF ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5 mr-2" />
                      )}
                      {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
                    </button>

                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className={cn(
                          "w-full flex items-center justify-center px-6 py-3",
                          "bg-secondary/10 text-secondary border border-transparent rounded-lg font-semibold",
                          "hover:bg-secondary/20 transition-colors"
                        )}
                      >
                        <Share2 className="w-5 h-5 mr-2" />
                        Share Course
                      </button>
                      {shareFeedback && (
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                          {shareFeedback}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}