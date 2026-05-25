"use client";

import { Navbar } from "@/components/navigation/navbar";
import { motion } from "framer-motion";
import { CheckCircle, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Suspense, useEffect, useState } from "react";
import {
  getExamResult,
  getStudentDisplayName,
  letterGrade,
  formatSubmittedAt,
  formatDuration,
  type StoredExamResult,
} from "@/lib/exam-result-storage";

export default function ReviewResultPage() {
  return (
    <Suspense fallback={null}>
      <ReviewResultContent />
    </Suspense>
  );
}

function ReviewResultContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId") || "1";
  const [result, setResult] = useState<StoredExamResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setResult(getExamResult(examId));
    setReady(true);
  }, [examId]);

  const studentName = getStudentDisplayName();

  const renderCircularProgress = (percentage: number, color: string = "#6A0F1C") => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-300"
            style={{ color }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color }}>
              {percentage}%
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!ready) return null;

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-3">No saved results</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            There is no exam result for this ID in this session. Complete and submit an exam first, or open the review link right after submitting.
          </p>
          <Link
            href="/my-exam"
            className={cn(
              "inline-flex px-6 py-3 rounded-lg font-semibold",
              "bg-primary text-white hover:bg-primary-dark"
            )}
          >
            My exams
          </Link>
        </div>
      </div>
    );
  }

  const grade = letterGrade(result.scorePercent);
  const passed = result.scorePercent >= result.passMark;
  const answeredCount = result.questions.filter(
    (q) => q.userAnswer && q.userAnswer !== "(no answer)"
  ).length;
  const timeLabel =
    result.timeUsedSeconds != null
      ? formatDuration(result.timeUsedSeconds)
      : "—";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
          <div className="xl:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card-light dark:bg-card-dark rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-success/20 rounded-full mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-success" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">Submission received</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Your answers were saved. Below is your auto-graded score (multiple choice only).
                </p>
              </div>

              <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Student name
                    </p>
                    <p className="font-semibold">{studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Exam
                    </p>
                    <p className="font-semibold">{result.examTitle}</p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="inline-block bg-primary/10 rounded-full px-8 py-4 mb-4">
                  <p className="text-5xl font-bold text-primary mb-1">
                    {result.scorePercent}%
                  </p>
                  <p className="text-2xl font-semibold text-primary">
                    Grade: {grade}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Score: {result.mcqCorrect} / {result.mcqTotal} (MCQ)
                  </p>
                  <p
                    className={cn(
                      "text-sm font-medium mt-2",
                      passed ? "text-success" : "text-error"
                    )}
                  >
                    {passed ? "Passed" : "Did not reach pass mark"} (≥{" "}
                    {result.passMark}%)
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    Questions with an answer
                  </span>
                  <span className="font-semibold">
                    {answeredCount} / {result.totalQuestions}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(answeredCount / Math.max(result.totalQuestions, 1)) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="bg-primary h-3 rounded-full"
                  />
                </div>
              </div>

              <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-500 dark:border-yellow-700 rounded-lg p-4 mb-6">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  Submitted on {formatSubmittedAt(result.submittedAt)}. Essay
                  responses are not auto-scored.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/exam/results/${result.examId}`}
                  className={cn(
                    "flex-1 flex items-center justify-center px-6 py-3",
                    "bg-primary text-white rounded-lg font-semibold",
                    "hover:bg-primary-dark transition-colors"
                  )}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Review all answers
                </Link>
                <Link
                  href={`/certificates/${result.examId}`}
                  className={cn(
                    "flex-1 flex items-center justify-center px-6 py-3",
                    "border-2 border-primary text-primary rounded-lg font-semibold",
                    "hover:bg-primary hover:text-white transition-colors"
                  )}
                >
                  <Download className="w-5 h-5 mr-2" />
                  View certificate
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="xl:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-4 text-center">
                Performance overview
              </h3>
              {renderCircularProgress(result.scorePercent, "#6A0F1C")}
              <p className="text-center mt-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                COMPLETED
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-4">Quick stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    MCQ correct
                  </span>
                  <span className="font-semibold">
                    {result.mcqCorrect} / {result.mcqTotal}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Time used
                  </span>
                  <span className="font-semibold">{timeLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Passing grade
                  </span>
                  <span className="font-semibold text-success">
                    {result.passMark}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
