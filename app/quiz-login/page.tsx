"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils/cn";
import { STUDENT_NAME_KEY } from "@/lib/exam-result-storage";
import Link from "next/link";

const loginSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function QuizLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (typeof window !== "undefined") {
      localStorage.setItem(STUDENT_NAME_KEY, data.name.trim());
    }
    router.push("/exam/1");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="text-right mb-6">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your credentials to start the exam
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
            >
              Enter Name
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              placeholder="Enter your name"
              className={cn(
                "w-full px-4 py-3 rounded-xl border-2",
                "bg-gray-100 dark:bg-gray-700",
                "border-gray-400 dark:border-gray-600",
                "text-gray-800 dark:text-gray-200 font-medium",
                "focus:ring-2 focus:ring-primary focus:border-primary",
                "focus:outline-none",
                errors.name && "border-red-500"
              )}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <Link
                href="#"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                Forget password?
              </Link>
            </div>

            <input
              {...register("password")}
              type="password"
              id="password"
              placeholder="Enter your password"
              className={cn(
                "w-full px-4 py-3 rounded-xl border-2",
                "bg-gray-100 dark:bg-gray-700",
                "border-gray-400 dark:border-gray-600",
                "text-gray-800 dark:text-gray-200 font-medium",
                "focus:ring-2 focus:ring-primary focus:border-primary",
                "focus:outline-none",
                errors.password && "border-red-500"
              )}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-4 px-6 rounded-xl font-semibold text-lg",
              "bg-primary text-white",
              "hover:bg-primary-dark transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "shadow-lg hover:shadow-xl"
            )}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}