"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", enrollments: 40, completions: 28 },
  { month: "Feb", enrollments: 55, completions: 38 },
  { month: "Mar", enrollments: 62, completions: 45 },
  { month: "Apr", enrollments: 70, completions: 52 },
];

export default function InstructorAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Course Analytics</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        Track enrollments and completion rates to improve course quality.
      </p>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 bg-card-light dark:bg-card-dark">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="enrollments" fill="#800020" name="Enrollments" />
            <Bar dataKey="completions" fill="#C9A24D" name="Completions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
