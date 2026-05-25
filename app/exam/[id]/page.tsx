"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle,
  Circle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";
import { getDemoExam } from "@/lib/demo-exam";

import {
  gradeExamSubmission,
  saveExamResult,
} from "@/lib/exam-result-storage";

import { proctorUrl } from "@/lib/config/proctor";

const MOUSE_MOVE_WINDOW_MS = 2500;
const MOUSE_MOVE_LOCK_PX = 38000;

export default function ExamPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const examData = getDemoExam(params.id);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [timeRemaining, setTimeRemaining] = useState(
    examData.durationMinutes * 60
  );

  const [proctorSuspicious, setProctorSuspicious] = useState(false);

  const [proctorMessage, setProctorMessage] =
    useState<string | null>(null);

  const lockedRef = useRef(false);

  const exitedRef = useRef(false);

  const mouseAccumRef = useRef(0);

  const mouseWindowStartRef = useRef<number | null>(null);

  const lastMouseRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const lockExam = useCallback((message: string) => {
    if (lockedRef.current) return;

    lockedRef.current = true;

    setProctorSuspicious(true);

    setProctorMessage(message);

    fetch(proctorUrl("stop-proctor"), {
      method: "POST",
    }).catch(() => {});
  }, []);

  const forceExitExam = useCallback(
    (message: string) => {
      if (exitedRef.current) return;

      exitedRef.current = true;

      lockExam(message);

      window.location.replace("/my-exam");
    },
    [lockExam]
  );

  // ================= TIMER =================

  useEffect(() => {
    if (proctorSuspicious) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [proctorSuspicious]);

  // ================= TAB SWITCH DETECT =================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        forceExitExam(
          "Exam ended: you switched tab or left the page."
        );
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [forceExitExam]);

  // ================= MOUSE MONITOR =================

  useEffect(() => {
    if (proctorSuspicious) return;

    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();

      if (mouseWindowStartRef.current === null) {
        mouseWindowStartRef.current = now;
      }

      const prev = lastMouseRef.current;

      lastMouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      if (prev) {
        mouseAccumRef.current +=
          Math.abs(e.clientX - prev.x) +
          Math.abs(e.clientY - prev.y);
      }

      if (
        now - mouseWindowStartRef.current >=
        MOUSE_MOVE_WINDOW_MS
      ) {
        if (
          mouseAccumRef.current >=
          MOUSE_MOVE_LOCK_PX
        ) {
          lockExam(
            "Suspicious mouse movement detected."
          );
        }

        mouseAccumRef.current = 0;

        mouseWindowStartRef.current = now;
      }
    };

    window.addEventListener(
      "mousemove",
      onMouseMove,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        "mousemove",
        onMouseMove
      );
  }, [lockExam, proctorSuspicious]);

  // ================= ADVANCED PROCTORING =================

  useEffect(() => {
    if (proctorSuspicious) return;

    const blockExam = (reason: string) => {
      lockExam(reason);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      blockExam("Right click detected.");
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();

      blockExam("Copy detected.");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();

      blockExam("Paste detected.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const forbidden =
        (e.ctrlKey &&
          ["c", "v", "x", "t", "w", "u", "i"].includes(
            e.key
          )) ||
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["i", "j", "c"].includes(e.key));

      if (forbidden) {
        e.preventDefault();

        blockExam(
          "Forbidden shortcut detected."
        );
      }
    };

    let devtoolsOpen = false;

    const detectDevTools = () => {
      const threshold = 160;

      if (
        window.outerWidth -
          window.innerWidth >
          threshold ||
        window.outerHeight -
          window.innerHeight >
          threshold
      ) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;

          blockExam("DevTools detected.");
        }
      }
    };

    const devToolsInterval = setInterval(
      detectDevTools,
      1000
    );

    window.addEventListener(
      "contextmenu",
      handleContextMenu
    );

    window.addEventListener("copy", handleCopy);

    window.addEventListener("paste", handlePaste);

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      clearInterval(devToolsInterval);

      window.removeEventListener(
        "contextmenu",
        handleContextMenu
      );

      window.removeEventListener(
        "copy",
        handleCopy
      );

      window.removeEventListener(
        "paste",
        handlePaste
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [lockExam, proctorSuspicious]);

  // ================= CAMERA PROCTOR =================

  useEffect(() => {
    let poll: ReturnType<
      typeof setInterval
    > | null = null;

    let cancelled = false;

    const start = async () => {
      try {
        await fetch(
          proctorUrl("start-proctor"),
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              camera_index: 0,
            }),
          }
        );
      } catch {
        return;
      }

      poll = setInterval(async () => {
        try {
          const res = await fetch(
            proctorUrl("status")
          );

          const data = await res.json();

          if (cancelled) return;

          if (data?.suspicious) {
            lockExam(
              data?.last_message ||
                "Camera violation detected."
            );

            if (poll) clearInterval(poll);
          }
        } catch {}
      }, 1500);
    };

    start();

    return () => {
      cancelled = true;

      if (poll) clearInterval(poll);

      fetch(
        proctorUrl("stop-proctor"),
        {
          method: "POST",
        }
      ).catch(() => {});
    };
  }, [params.id, lockExam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (
    questionId: number,
    answer: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    if (proctorSuspicious) return;

    if (
      !confirm(
        "Are you sure you want to submit the exam?"
      )
    )
      return;

    const durationSeconds =
      examData.durationMinutes * 60;

    const timeUsedSeconds =
      durationSeconds - timeRemaining;

    const result = gradeExamSubmission(
      examData,
      params.id,
      answers,
      {
        timeUsedSeconds: Math.max(
          0,
          timeUsedSeconds
        ),
      }
    );

    saveExamResult(result);

    router.push(`/exam/results/${params.id}`);
  };

  const handleExitExam = () => {
    router.push("/my-exam");
  };

  const question =
    examData.questions[currentQuestion];

  const totalQuestions = examData.questions.length;

  const answeredCount =
    Object.keys(answers).length;

  const remainingCount =
    totalQuestions - answeredCount;

  const completionPercentage = Math.round(
    (answeredCount / totalQuestions) * 100
  );

  const isLastQuestion =
    currentQuestion === totalQuestions - 1;

  const isFirstQuestion = currentQuestion === 0;

  const isLowTime = timeRemaining < 5 * 60;

  const goToPrevious = () => {
    if (proctorSuspicious || isFirstQuestion) return;
    setCurrentQuestion((prev) => prev - 1);
  };

  const goToNext = () => {
    if (proctorSuspicious || isLastQuestion) return;
    setCurrentQuestion((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {proctorSuspicious && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <AlertTriangle className="w-6 h-6 text-error mr-3 shrink-0" />

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Exam locked
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {proctorMessage ||
                "Your exam has been ended for security reasons."}
            </p>

            <button
              onClick={handleExitExam}
              className="w-full py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              Exit exam
            </button>
          </div>
        </div>
      )}

      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                {examData.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Question {currentQuestion + 1} of{" "}
                {totalQuestions}
              </p>
            </div>

            <div
              className={cn(
                "inline-flex items-center self-start sm:self-auto px-4 py-2 rounded-lg border font-mono text-base font-semibold tabular-nums",
                isLowTime
                  ? "border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                  : "border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              )}
            >
              <span className="text-xs font-sans font-medium text-gray-500 dark:text-gray-400 mr-2">
                Time left
              </span>
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="pb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>
                Question {currentQuestion + 1} / {totalQuestions}
              </span>
              <span>{completionPercentage}% complete</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] xl:grid-cols-[1fr_240px] gap-6 lg:gap-8">
          {/* Question area */}
          <div className="min-w-0 space-y-4">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8"
            >
              <p className="text-sm font-medium text-primary mb-2">
                Question {currentQuestion + 1}
              </p>

              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-6 sm:mb-8">
                {question.question}
              </h2>

              {question.type === "multiple-choice" ? (
                <div className="space-y-3" role="radiogroup">
                  {question.options?.map((option, index) => {
                    const isSelected =
                      answers[question.id] === option;

                    return (
                      <label
                        key={index}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={isSelected}
                          onChange={(e) =>
                            handleAnswerChange(
                              question.id,
                              e.target.value
                            )
                          }
                          className="mt-1 w-4 h-4 shrink-0 text-primary focus:ring-primary"
                        />
                        <span className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(
                      question.id,
                      e.target.value
                    )
                  }
                  className="w-full min-h-[200px] sm:min-h-[240px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                  placeholder="Type your answer here..."
                />
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={isFirstQuestion || proctorSuspicious}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                  isFirstQuestion || proctorSuspicious
                    ? "border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-800 dark:text-gray-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-3 sm:ml-auto">
                {isLastQuestion ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={proctorSuspicious}
                    className={cn(
                      "flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      proctorSuspicious
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary-dark"
                    )}
                  >
                    Submit Exam
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goToNext}
                    disabled={proctorSuspicious}
                    className={cn(
                      "flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      proctorSuspicious
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary-dark"
                    )}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar navigator */}
          <aside className="lg:sticky lg:top-[calc(theme(spacing.0)+1px)] lg:self-start">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Questions
              </h3>

              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2 mb-4">
                {examData.questions.map((q, index) => {
                  const isCurrent = currentQuestion === index;
                  const isAnswered = Boolean(answers[q.id]);

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestion(index)}
                      disabled={proctorSuspicious}
                      className={cn(
                        "aspect-square min-w-0 rounded-lg text-xs font-semibold transition-colors",
                        isCurrent
                          ? "bg-primary text-white"
                          : isAnswered
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700",
                        proctorSuspicious && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span>
                    Answered:{" "}
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {answeredCount}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    Remaining:{" "}
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      {remainingCount}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
