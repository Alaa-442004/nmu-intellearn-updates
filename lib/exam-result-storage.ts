import type { DemoExam } from "@/lib/demo-exam";

export type GradedQuestion = {
  id: number;
  question: string;
  type: "multiple-choice" | "essay";
  userAnswer: string;
  correctAnswer?: string;
  status: "correct" | "incorrect" | "pending";
};

export type StoredExamResult = {
  examId: string;
  examTitle: string;
  submittedAt: string;
  passMark: number;
  scorePercent: number;
  mcqCorrect: number;
  mcqTotal: number;
  totalQuestions: number;
  questions: GradedQuestion[];
  timeUsedSeconds?: number;
};

export const EXAM_RESULTS_KEY = "intellilearn_exam_results";
export const STUDENT_NAME_KEY = "intellilearn_student_name";

function readMap(): Record<string, StoredExamResult> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(EXAM_RESULTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StoredExamResult>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveExamResult(result: StoredExamResult): void {
  if (typeof window === "undefined") return;
  const map = readMap();
  map[result.examId] = result;
  sessionStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(map));
}

export function getExamResult(examId: string): StoredExamResult | null {
  if (typeof window === "undefined") return null;
  return readMap()[examId] ?? null;
}

export function getStudentDisplayName(): string {
  if (typeof window === "undefined") return "Student";
  return localStorage.getItem(STUDENT_NAME_KEY)?.trim() || "Student";
}

export function letterGrade(percent: number): string {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

export function gradeExamSubmission(
  exam: DemoExam,
  routeExamId: string,
  answers: Record<number, string>,
  opts?: { timeUsedSeconds?: number; passMark?: number }
): StoredExamResult {
  const passMark = opts?.passMark ?? 70;
  let mcqCorrect = 0;
  let mcqTotal = 0;
  const questions: GradedQuestion[] = [];

  for (const q of exam.questions) {
    const userAnswer = (answers[q.id] ?? "").trim();
    if (q.type === "multiple-choice") {
      mcqTotal++;
      const ok = userAnswer === q.correctAnswer;
      if (ok) mcqCorrect++;
      questions.push({
        id: q.id,
        question: q.question,
        type: "multiple-choice",
        userAnswer: userAnswer || "(no answer)",
        correctAnswer: q.correctAnswer,
        status: ok ? "correct" : "incorrect",
      });
    } else {
      questions.push({
        id: q.id,
        question: q.question,
        type: "essay",
        userAnswer: userAnswer || "(no answer)",
        status: "pending",
      });
    }
  }

  const scorePercent =
    mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;

  return {
    examId: routeExamId,
    examTitle: exam.title,
    submittedAt: new Date().toISOString(),
    passMark,
    scorePercent,
    mcqCorrect,
    mcqTotal,
    totalQuestions: exam.questions.length,
    questions,
    timeUsedSeconds: opts?.timeUsedSeconds,
  };
}

export function formatSubmittedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
