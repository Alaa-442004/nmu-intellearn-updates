"use client";

import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const questions = [
  {
    id: 1,
    question: "What is the output of typeof null in JavaScript?",
    type: "Multiple Choice",
    category: "JavaScript Basics",
    difficulty: "Easy",
  },
  {
    id: 2,
    question: "Explain the difference between var, let, and const.",
    type: "Essay",
    category: "JavaScript Basics",
    difficulty: "Medium",
  },
  {
    id: 3,
    question: "What is a closure in JavaScript?",
    type: "Multiple Choice",
    category: "Advanced JavaScript",
    difficulty: "Hard",
  },
];

export default function AdminQuestionsPage() {
  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Question Bank</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage questions for exams
              </p>
            </div>
            <button
              className={cn(
                "flex items-center px-4 py-2",
                "bg-primary text-white rounded-lg font-semibold",
                "hover:bg-primary-dark transition-colors"
              )}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Question
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <button className={cn("flex items-center px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700")}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold mb-2">{q.question}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>{q.type}</span>
                      <span>•</span>
                      <span>{q.category}</span>
                      <span>•</span>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-semibold",
                          q.difficulty === "Easy"
                            ? "bg-success/20 text-success"
                            : q.difficulty === "Medium"
                            ? "bg-accent/20 text-accent"
                            : "bg-error/20 text-error"
                        )}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-error/20 text-error rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
  );
}
