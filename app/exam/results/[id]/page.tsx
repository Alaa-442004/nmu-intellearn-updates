"use client";

import { Navbar } from "@/components/navigation/navbar";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Award, Share2, FileText, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";
import {
  getExamResult,
  formatSubmittedAt,
  formatDuration,
  type StoredExamResult,
} from "@/lib/exam-result-storage";

export default function ExamResultsPage({ params }: { params: { id: string } }) {
  const [result, setResult] = useState<StoredExamResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setResult(getExamResult(params.id));
    setReady(true);
  }, [params.id]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading results…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-3">No results found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Submit an exam first to see your answers and score here. Results are kept for this browser session only.
          </p>
          <Link
            href="/my-exam"
            className={cn(
              "inline-flex px-6 py-3 rounded-lg font-semibold",
              "bg-primary text-white hover:bg-primary-dark"
            )}
          >
            Go to My Exams
          </Link>
        </div>
      </div>
    );
  }

  const passed = result.scorePercent >= result.passMark;
  const incorrectMcq = result.mcqTotal - result.mcqCorrect;
  const timeLabel = result.timeUsedSeconds != null
    ? formatDuration(result.timeUsedSeconds)
    : "—";

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-success/20 rounded-full mb-4"
            >
              <Award className="w-10 h-10 text-success" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Exam submitted</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {result.examTitle}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "bg-card-light dark:bg-card-dark rounded-2xl p-8 border-2",
              passed ? "border-success shadow-xl" : "border-error shadow-xl",
              "mb-8"
            )}
          >
            <div className="text-center">
              <div className="inline-flex flex-col items-center justify-center min-w-[8rem] min-h-[8rem] rounded-full bg-primary/10 mb-4 px-6 py-4">
                <span className="text-5xl font-bold text-primary">
                  {result.scorePercent}%
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Auto-graded (multiple choice)
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Score: {result.mcqCorrect} / {result.mcqTotal} correct
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {result.totalQuestions} questions total (essay items are not auto-scored)
              </p>
              <h2
                className={cn(
                  "text-2xl font-bold mb-2",
                  passed ? "text-success" : "text-error"
                )}
              >
                {passed ? "You passed" : "Below passing score"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Pass mark: {result.passMark}%
              </p>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">
                    {result.mcqCorrect}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Correct (MCQ)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-error">
                    {incorrectMcq}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Incorrect (MCQ)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {result.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total questions
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
          >
            <h3 className="text-xl font-semibold mb-4">Exam details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Time used (session)
                </span>
                <span className="font-semibold">{timeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Submitted at
                </span>
                <span className="font-semibold">
                  {formatSubmittedAt(result.submittedAt)}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
          >
            <h3 className="text-xl font-semibold mb-4">Your answers</h3>
            <div className="space-y-4">
              {result.questions.map((q, index) => (
                <div
                  key={q.id}
                  className={cn(
                    "p-4 rounded-lg border-2",
                    q.status === "correct" && "border-success/50 bg-success/5",
                    q.status === "incorrect" && "border-error/50 bg-error/5",
                    q.status === "pending" &&
                      "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold">Question {index + 1}</span>
                    {q.status === "correct" && (
                      <CheckCircle className="w-5 h-5 text-success shrink-0" />
                    )}
                    {q.status === "incorrect" && (
                      <XCircle className="w-5 h-5 text-error shrink-0" />
                    )}
                    {q.status === "pending" && (
                      <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {q.question}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">
                        Your answer:{" "}
                      </span>
                      <span className="font-semibold">{q.userAnswer}</span>
                    </div>
                    {q.status === "incorrect" && q.correctAnswer && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">
                          Correct answer:{" "}
                        </span>
                        <span className="font-semibold text-success">
                          {q.correctAnswer}
                        </span>
                      </div>
                    )}
                    {q.status === "pending" && (
                      <p className="text-amber-800 dark:text-amber-200 text-sm">
                        Essay — pending instructor review (not included in auto score).
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href={`/review-result?examId=${result.examId}`}
              className={cn(
                "flex-1 flex items-center justify-center px-6 py-3",
                "bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700",
                "text-primary rounded-lg font-semibold",
                "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              )}
            >
              <FileText className="w-5 h-5 mr-2" />
              Summary review page
            </Link>
            <Link
              href={`/certificates/${result.examId}`}
              className={cn(
                "flex-1 flex items-center justify-center px-6 py-3",
                "bg-primary text-white rounded-lg font-semibold",
                "hover:bg-primary-dark transition-colors"
              )}
            >
              <Award className="w-5 h-5 mr-2" />
              View certificate
            </Link>
            {passed && (
              <button
                type="button"
                className={cn(
                  "flex-1 flex items-center justify-center px-6 py-3",
                  "bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700",
                  "text-primary rounded-lg font-semibold",
                  "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                )}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share result
              </button>
            )}
            <Link
              href="/my-exam"
              className={cn(
                "flex-1 flex items-center justify-center px-6 py-3",
                "bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700",
                "rounded-lg font-semibold",
                "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              )}
            >
              Back to My Exams
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
