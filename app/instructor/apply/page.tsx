"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialty: z.string().min(2, "Specialty is required"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function InstructorApplyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/instructor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || "Application failed.");
        return;
      }
      router.push("/instructor/pending");
    } catch {
      setError("Unable to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Become an Instructor</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Apply to create and publish courses on NMU IntelliLearn. No external
            selling — fully platform-contained.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card-light dark:bg-card-dark rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-lg"
        >
          {(
            [
              ["name", "Full name", "text"],
              ["email", "Email", "email"],
              ["password", "Password (for login after approval)", "password"],
              ["specialty", "Specialty", "text"],
            ] as const
          ).map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                {...register(key)}
                type={type}
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg border bg-background-light dark:bg-background-dark",
                  "border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-primary",
                  errors[key] && "border-error"
                )}
              />
              {errors[key] && (
                <p className="text-sm text-error mt-1">{errors[key]?.message}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              {...register("bio")}
              rows={4}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg border bg-background-light dark:bg-background-dark",
                "border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-primary",
                errors.bio && "border-error"
              )}
            />
            {errors.bio && (
              <p className="text-sm text-error mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Portfolio URL (optional)
            </label>
            <input
              {...register("portfolioUrl")}
              type="url"
              placeholder="https://"
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit application"
            )}
          </Button>
        </form>

        <p className="text-center text-sm mt-6 text-neutral-500">
          Already approved?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
