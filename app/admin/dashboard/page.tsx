"use client";

import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  FileText,
  DollarSign,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils/cn";

const stats = [
  { title: "Total Students", value: "2,450", icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { title: "Active Courses", value: "45", icon: BookOpen, color: "text-primary", bgColor: "bg-primary/10" },
  { title: "Exams Created", value: "320", icon: FileText, color: "text-accent", bgColor: "bg-accent/10" },
  { title: "Total Revenue", value: "$125K", icon: DollarSign, color: "text-success", bgColor: "bg-success/10" },
];

const enrollmentData = [
  { month: "Jan", enrollments: 120, completions: 85 },
  { month: "Feb", enrollments: 150, completions: 110 },
  { month: "Mar", enrollments: 180, completions: 140 },
  { month: "Apr", enrollments: 200, completions: 165 },
  { month: "May", enrollments: 220, completions: 185 },
  { month: "Jun", enrollments: 250, completions: 210 },
];

const courseDistribution = [
  { name: "JavaScript", value: 35, color: "#800020" },
  { name: "React", value: 25, color: "#C9A24D" },
  { name: "Node.js", value: 20, color: "#2ECC71" },
  { name: "Python", value: 20, color: "#3498DB" },
];

export default function AdminDashboardPage() {
  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Overview of your platform
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={cn(
                  "bg-card-light dark:bg-card-dark rounded-xl p-6",
                  "border border-gray-200 dark:border-gray-700",
                  "shadow-lg hover:shadow-xl transition-shadow"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", stat.bgColor)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Enrollment Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#800020" name="Enrollments" />
                  <Bar dataKey="completions" fill="#C9A24D" name="Completions" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Course Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {courseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-card-light dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: "New student registered", time: "2 hours ago", type: "user" },
                { action: "Course 'React Advanced' published", time: "5 hours ago", type: "course" },
                { action: "Exam 'JavaScript Basics' completed by 15 students", time: "1 day ago", type: "exam" },
                { action: "New payment received: $299", time: "1 day ago", type: "payment" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      {activity.type === "user" && <Users className="w-5 h-5 text-primary" />}
                      {activity.type === "course" && <BookOpen className="w-5 h-5 text-primary" />}
                      {activity.type === "exam" && <FileText className="w-5 h-5 text-primary" />}
                      {activity.type === "payment" && <DollarSign className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
  );
}
