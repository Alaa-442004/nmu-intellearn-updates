"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const enrollmentData = [
  { month: "Jan", enrollments: 120, completions: 85 },
  { month: "Feb", enrollments: 150, completions: 110 },
  { month: "Mar", enrollments: 180, completions: 140 },
  { month: "Apr", enrollments: 200, completions: 165 },
  { month: "May", enrollments: 220, completions: 185 },
  { month: "Jun", enrollments: 250, completions: 210 },
];

const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 15000 },
  { month: "Mar", revenue: 18000 },
  { month: "Apr", revenue: 20000 },
  { month: "May", revenue: 22000 },
  { month: "Jun", revenue: 25000 },
];

const performanceData = [
  { course: "JavaScript", avgScore: 85, students: 1250 },
  { course: "React", avgScore: 88, students: 2100 },
  { course: "Node.js", avgScore: 82, students: 980 },
  { course: "Python", avgScore: 90, students: 1500 },
];

export default function AdminAnalyticsPage() {
  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Comprehensive platform analytics
          </p>

          {/* Enrollment Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Enrollment Trends</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stackId="1"
                  stroke="#6A0F1C"
                  fill="#6A0F1C"
                  name="Enrollments"
                />
                <Area
                  type="monotone"
                  dataKey="completions"
                  stackId="1"
                  stroke="#C9A24D"
                  fill="#C9A24D"
                  name="Completions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Revenue Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2ECC71"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Course Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="avgScore"
                  fill="#6A0F1C"
                  name="Average Score (%)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="students"
                  fill="#C9A24D"
                  name="Students"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
  );
}
