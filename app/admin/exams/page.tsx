"use client";

import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const exams = [
  {
    id: 1,
    title: "JavaScript Fundamentals Exam",
    course: "Advanced JavaScript Mastery",
    duration: 60,
    questions: 10,
    students: 125,
  },
  {
    id: 2,
    title: "React Concepts Quiz",
    course: "React & Next.js Complete Guide",
    duration: 45,
    questions: 15,
    students: 210,
  },
];

export default function AdminExamsPage() {
  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Exam Builder</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Create and manage exams
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
              Create Exam
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {exams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{exam.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{exam.course}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-error/20 text-error rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
                    <p className="font-semibold">{exam.duration} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Questions</p>
                    <p className="font-semibold">{exam.questions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Students</p>
                    <p className="font-semibold">{exam.students}</p>
                  </div>
                </div>
                <button className={cn("w-full flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
  );
}
