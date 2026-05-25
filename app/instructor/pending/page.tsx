"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

export default function InstructorPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Application under review</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Thank you for applying. An administrator will review your application.
          Once approved, sign in with the email and password you provided.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
