export type DemoQuestionMCQ = {
  id: number;
  question: string;
  options: string[];
  type: "multiple-choice";
  correctAnswer: string;
};

export type DemoQuestionEssay = {
  id: number;
  question: string;
  type: "essay";
};

export type DemoQuestion = DemoQuestionMCQ | DemoQuestionEssay;

export type DemoExam = {
  id: string;
  title: string;
  durationMinutes: number;
  questions: DemoQuestion[];
};

const JAVASCRIPT_FUNDAMENTALS: DemoExam = {
  id: "1",
  title: "JavaScript Fundamentals Exam",
  durationMinutes: 60,
  questions: [
    {
      id: 1,
      question: "What is the output of typeof null in JavaScript?",
      options: ["object", "null", "undefined", "boolean"],
      type: "multiple-choice",
      correctAnswer: "object",
    },
    {
      id: 2,
      question: "Which method is used to add an element to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      type: "multiple-choice",
      correctAnswer: "push()",
    },
    {
      id: 3,
      question: "What does 'use strict' do in JavaScript?",
      options: [
        "Enables strict mode",
        "Disables strict mode",
        "Nothing",
        "Throws an error",
      ],
      type: "multiple-choice",
      correctAnswer: "Enables strict mode",
    },
    {
      id: 4,
      question: "Explain the difference between var, let, and const.",
      type: "essay",
    },
    {
      id: 5,
      question: "What is a closure in JavaScript?",
      options: [
        "A function inside another function",
        "A way to access outer scope from inner function",
        "A JavaScript error",
        "A data type",
      ],
      type: "multiple-choice",
      correctAnswer: "A way to access outer scope from inner function",
    },
  ],
};

/** Demo: several routes reuse the same question bank */
export function getDemoExam(routeExamId: string): DemoExam {
  return { ...JAVASCRIPT_FUNDAMENTALS, id: routeExamId };
}
