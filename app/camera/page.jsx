"use client";

/**
 * Camera test page — verifies webcam pipeline before / during proctoring.
 * Uses AIExamProctor (face-api detection runs after camera + models are ready).
 */

import AIExamProctor from "@/components/proctor/AIExamProctor";

export default function CameraPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Exam camera check
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Allow camera access when prompted. Open the browser console to see
            debug logs from the camera pipeline.
          </p>
        </header>

        <AIExamProctor
          enabled
          showPreview
          className="w-full shadow-sm"
          onReady={() => console.log("[Camera Page] Proctor ready (camera + models)")}
          onError={(err) => console.error("[Camera Page] Proctor error", err)}
        />
      </div>
    </div>
  );
}
