"use client";

import { Navbar } from "@/components/navigation/navbar";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils/cn";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async () => {
    setIsLoading(true);
    // Temporary local flow until backend reset endpoint is added.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Enter your email to receive reset instructions
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border",
                      "bg-background-light dark:bg-background-dark",
                      "border-gray-300 dark:border-gray-600",
                      "focus:ring-2 focus:ring-primary focus:border-transparent",
                      errors.email && "border-error"
                    )}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-semibold",
                    "bg-primary text-white",
                    "hover:bg-primary-dark transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "shadow-lg hover:shadow-xl"
                  )}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  If the email exists in our system, a password reset message has been sent.
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-primary font-semibold hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
