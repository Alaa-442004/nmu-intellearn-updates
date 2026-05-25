"use client";

import { Navbar } from "@/components/navigation/navbar";
import { motion } from "framer-motion";
import {
  Search,
  Mic,
  Clock,
  CheckCircle,
  PlayCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed Exams" },
  { id: "upcoming", label: "Upcoming Exams" },
];

const DEFAULT_START = { label: "Start Exam", link: "/exam-proctoring" };

const upcomingExams = [
  {
    id: 1,
    title: "Final Exam - Time Management",
    course: "Time Management Basics",
    duration: "60 mins",
    status: "Not Started",
    image: "/ecc1535ba158700e2dc112c58ead9531f6b487db.png",
    action: DEFAULT_START,
  },
  {
    id: 2,
    title: "Midterm - Digital Marketing",
    course: "Marketing Essentials",
    duration: "90 mins",
    status: "Not Started",
    image: "/9a89255dd892bbb2a2d5521ee3c4f1694b4d1466.png",
    action: DEFAULT_START,
  },
  {
    id: 3,
    title: "Quiz - Financial Accounting",
    course: "Accounting Fundamentals",
    duration: "30 mins",
    status: "Not Started",
    image: "/8320a60207fe1fb5cb3f0d50980155d14644f840.png",
    action: DEFAULT_START,
  },
  {
    id: 4,
    title: "Mock Exam - PMP Preparation",
    course: "Advanced PMP Prep",
    duration: "120 mins",
    status: "Not Started",
    image: "/50943e8f7b279d590bdcbe027c96d49d4c3be1ad.png",
    action: DEFAULT_START,
  },
];

const inProgressExams = [
  {
    id: 5,
    title: "Midterm - Project Management",
    course: "Project Management 101",
    duration: "90 mins",
    status: "In Progress",
    progress: 45,
  },
  {
    id: 6,
    title: "Quiz - Communication Skills",
    course: "Soft Skills for Leaders",
    duration: "20 mins",
    status: "In Progress",
    progress: 70,
  },
];

const completedExams = [
  {
    id: 7,
    title: "Quiz - Agile Methodologies",
    course: "Advanced PMP Prep",
    score: 85,
    status: "Completed",
  },
  {
    id: 8,
    title: "Midterm - HR Management",
    course: "HR Essentials",
    score: 92,
    status: "Completed",
  },
  {
    id: 9,
    title: "Final - Software Engineering",
    course: "Computer Science Basics",
    score: 89,
    status: "Completed",
  },
  {
    id: 10,
    title: "Quiz - Leadership Skills",
    course: "Management & Leadership",
    score: 95,
    status: "Completed",
  },
];

function matchesSearch(
  query: string,
  parts: (string | undefined)[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return parts.some((p) => (p || "").toLowerCase().includes(q));
}

export default function MyExamPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUpcoming = useMemo(
    () =>
      upcomingExams.filter((e) =>
        matchesSearch(searchQuery, [e.title, e.course, e.status])
      ),
    [searchQuery]
  );
  const filteredInProgress = useMemo(
    () =>
      inProgressExams.filter((e) =>
        matchesSearch(searchQuery, [e.title, e.course, e.status])
      ),
    [searchQuery]
  );
  const filteredCompleted = useMemo(
    () =>
      completedExams.filter((e) =>
        matchesSearch(searchQuery, [e.title, e.course, e.status, String(e.score)])
      ),
    [searchQuery]
  );

  const examStats = {
    total: 12,
    completed: 6,
    inProgress: 2,
    notStarted: 4,
    overallCompletion: 72,
  };

  const renderCircularProgress = (percentage: number) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-32 h-32">
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
            className="text-primary transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{percentage}%</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-12 pr-12 py-4 rounded-lg border-0",
                "bg-[#D9D9D9] dark:bg-gray-700",
                "text-gray-800 dark:text-gray-200",
                "focus:ring-2 focus:ring-primary focus:outline-none"
              )}
            />
            <Mic className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer" />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-card-light dark:bg-card-dark text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total Exams", value: examStats.total, icon: FileText, color: "text-blue-500" },
                { label: "Completed", value: examStats.completed, icon: CheckCircle, color: "text-success" },
                { label: "In Progress", value: examStats.inProgress, icon: PlayCircle, color: "text-accent" },
                { label: "Not Started", value: examStats.notStarted, icon: Clock, color: "text-gray-500" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={cn("w-8 h-8", stat.color)} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Overall Completion */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-card-light dark:bg-card-dark rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg text-center"
            >
              <h3 className="text-xl font-semibold mb-4">Overall Completion</h3>
              <div className="flex justify-center mb-4">
                {renderCircularProgress(examStats.overallCompletion)}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                You have completed {examStats.overallCompletion}% of your exams
              </p>
            </motion.div>

            {/* Upcoming Exams */}
            {/* Upcoming Exams */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.7 }}
>
  <h2 className="text-2xl font-bold mb-6">Upcoming Exams</h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
    {filteredUpcoming.length === 0 && (
      <p className="col-span-full text-center text-gray-600 dark:text-gray-400 py-8">
        No upcoming exams match your search.
      </p>
    )}

    {filteredUpcoming.map((exam, index) => (
      <motion.div
        key={exam.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 + index * 0.1 }}
        whileHover={{ y: -5 }}
        className="bg-card-light dark:bg-card-dark rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg"
      >

        {/* الصورة الجديدة */}
        <div className="h-32 overflow-hidden">
          <img
            src="/images/fabric_1.png"
            alt="Exam"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-1">
            {exam.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {exam.course}
          </p>

          <div className="flex items-center justify-between text-sm mb-4">
            <span className="flex items-center text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-1" />
              {exam.duration}
            </span>

            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              {exam.status}
            </span>
          </div>

          {exam.action && (
            <Link
              href={exam.action.link}
              className="w-full block text-center px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              {exam.action.label}
            </Link>
          )}
        </div>

      </motion.div>
    ))}
  </div>
</motion.div>

            {/* In Progress Exams */}
            {inProgressExams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <h2 className="text-2xl font-bold mb-6">In Progress Exams</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredInProgress.length === 0 && (
                    <p className="col-span-full text-center text-gray-600 dark:text-gray-400 py-6">
                      No in-progress exams match your search.
                    </p>
                  )}
                  {filteredInProgress.map((exam, index) => (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                      className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold mb-1">{exam.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {exam.course}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
                          {exam.status}
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{exam.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${exam.progress}%` }}
                            transition={{ duration: 1 }}
                            className="bg-accent h-2 rounded-full"
                          />
                        </div>
                      </div>
                      <Link
                        href={`/exam/${exam.id}`}
                        className={cn(
                          "w-full block text-center px-4 py-2",
                          "bg-primary text-white rounded-lg font-semibold",
                          "hover:bg-primary-dark transition-colors"
                        )}
                      >
                        Resume Exam
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Completed Exams */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <h2 className="text-2xl font-bold mb-6">Completed Exams</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCompleted.length === 0 && (
                  <p className="col-span-full text-center text-gray-600 dark:text-gray-400 py-6">
                    No completed exams match your search.
                  </p>
                )}
                {filteredCompleted.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 + index * 0.1 }}
                    className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{exam.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {exam.course}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-success">{exam.score}%</p>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {exam.status}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/review-result?examId=${exam.id}`}
                      className={cn(
                        "w-full block text-center px-4 py-2",
                        "border-2 border-primary text-primary rounded-lg font-semibold",
                        "hover:bg-primary hover:text-white transition-colors"
                      )}
                    >
                      View Results
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab === "in-progress" && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredInProgress.length === 0 && (
              <p className="col-span-full text-center text-gray-600 dark:text-gray-400 py-12">
                No in-progress exams match your search.
              </p>
            )}
            {filteredInProgress.map((exam) => (
              <div
                key={exam.id}
                className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <h3 className="font-semibold mb-2">{exam.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {exam.course}
                </p>
                <Link
                  href={`/exam/${exam.id}`}
                  className={cn(
                    "w-full block text-center px-4 py-2",
                    "bg-primary text-white rounded-lg font-semibold",
                    "hover:bg-primary-dark transition-colors"
                  )}
                >
                  Resume Exam
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === "completed" && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCompleted.length === 0 && (
              <p className="col-span-full text-center text-gray-600 dark:text-gray-400 py-12">
                No completed exams match your search.
              </p>
            )}
            {filteredCompleted.map((exam) => (
              <div
                key={exam.id}
                className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">{exam.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {exam.course}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-success">{exam.score}%</p>
                </div>
                <Link
                  href={`/review-result?examId=${exam.id}`}
                  className={cn(
                    "w-full block text-center px-4 py-2",
                    "border-2 border-primary text-primary rounded-lg font-semibold",
                    "hover:bg-primary hover:text-white transition-colors"
                  )}
                >
                  View Results
                </Link>
              </div>
            ))}
          </div>
        )}

       {activeTab === "upcoming" && (
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

    {filteredUpcoming.length === 0 && (
      <p className="col-span-full text-center text-gray-600 dark:text-gray-400 py-12">
        No upcoming exams match your search.
      </p>
    )}

    {filteredUpcoming.map((exam) => (
      <div
        key={exam.id}
        className="bg-card-light dark:bg-card-dark rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg"
      >

        {/* الصورة الجديدة */}
        <div className="h-32 overflow-hidden">
          <img
            src="/images/fabric_1.png"
            alt="Exam"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">

          <h3 className="font-semibold mb-1">
            {exam.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {exam.course}
          </p>

          {exam.action && (
            <Link
              href={exam.action.link}
              className="w-full block text-center px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              {exam.action.label}
            </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
