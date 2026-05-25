"use client";

import { motion } from "framer-motion";
import { Search, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const students = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    enrolledCourses: 5,
    certificates: 3,
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    enrolledCourses: 8,
    certificates: 6,
    joinDate: "2024-02-01",
  },
];

export default function AdminStudentsPage() {
  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Students Management</h1>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage all students
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-lg border",
                  "bg-background-light dark:bg-background-dark",
                  "border-gray-300 dark:border-gray-600",
                  "focus:ring-2 focus:ring-primary focus:border-transparent"
                )}
              />
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="w-4 h-4 mr-1" />
                      {student.email}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Courses</p>
                    <p className="font-semibold">{student.enrolledCourses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Certificates</p>
                    <p className="font-semibold">{student.certificates}</p>
                  </div>
                </div>
                <button className={cn("w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800")}>
                  View Details
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
  );
}
