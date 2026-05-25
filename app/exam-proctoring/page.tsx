"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Mic, Camera, Monitor, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export default function ExamProctoringPage() {
  const router = useRouter();
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenMonitoringEnabled, setScreenMonitoringEnabled] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<{
    mic: "idle" | "requesting" | "granted" | "denied";
    camera: "idle" | "requesting" | "granted" | "denied";
    screen: "idle" | "requesting" | "granted" | "denied";
  }>({
    mic: "idle",
    camera: "idle",
    screen: "idle",
  });
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleRequestPermission = async (
    type: "mic" | "camera" | "screen"
  ) => {
    try {
      setPermissionStatus((prev) => ({ ...prev, [type]: "requesting" }));

      if (type === "mic") {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setMicrophoneEnabled(true);
        setPermissionStatus((prev) => ({ ...prev, mic: "granted" }));
        stream.getTracks().forEach((track) => track.stop());
      } else if (type === "camera") {
        setCameraError(null);
        // Request camera permission, but release the stream immediately so the Python proctor can open it.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setCameraEnabled(true);
        setPermissionStatus((prev) => ({ ...prev, camera: "granted" }));
        stream.getTracks().forEach((track) => track.stop());
      } else if (type === "screen") {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        setScreenMonitoringEnabled(true);
        setPermissionStatus((prev) => ({ ...prev, screen: "granted" }));
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      setPermissionStatus((prev) => ({ ...prev, [type]: "denied" }));
      if (type === "camera") {
        setCameraError(
          "Camera access failed. Check browser permissions or if another app is using the camera."
        );
      }
      alert(`Permission denied for ${type}. Please enable it in your browser settings.`);
    }
  };

  const canStartExam =
    microphoneEnabled &&
    cameraEnabled &&
    screenMonitoringEnabled &&
    agreedToRules;

  const handleStartExam = async () => {
    if (!canStartExam) return;

    router.push("/quiz-login");
  };

  const rules = [
    "No switching tabs.",
    "No mobile phones or external help.",
    "Camera & screen must remain on.",
    "Violations may lead to disqualification.",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/3 bg-gray-800 p-6"
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            Exam Proctoring
          </h1>

          <p className="text-sm text-gray-300 mb-6">
            Please complete the following steps before starting your exam
          </p>

          <div className="space-y-4">
            {/* Microphone */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Mic className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Microphone
                  </span>
                </div>
                {microphoneEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <button
                    onClick={() => handleRequestPermission("mic")}
                    disabled={permissionStatus.mic === "requesting"}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold",
                      "bg-primary text-white hover:bg-primary-dark",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {permissionStatus.mic === "requesting"
                      ? "Requesting..."
                      : "Enable"}
                  </button>
                )}
              </div>
              {permissionStatus.mic === "denied" && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Permission denied. Please enable in browser settings.
                </p>
              )}
            </div>

            {/* Camera */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Camera
                  </span>
                </div>
                {cameraEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <button
                    onClick={() => handleRequestPermission("camera")}
                    disabled={permissionStatus.camera === "requesting"}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold",
                      "bg-primary text-white hover:bg-primary-dark",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {permissionStatus.camera === "requesting"
                      ? "Requesting..."
                      : "Enable"}
                  </button>
                )}
              </div>
              {permissionStatus.camera === "denied" && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Permission denied. Please enable in browser settings.
                </p>
              )}
              {cameraError && (
                <p className="text-xs text-red-500 mt-1">{cameraError}</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    Screen Monitoring
                  </span>
                </div>
                {screenMonitoringEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <button
                    onClick={() => handleRequestPermission("screen")}
                    disabled={permissionStatus.screen === "requesting"}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold",
                      "bg-primary text-white hover:bg-primary-dark",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {permissionStatus.screen === "requesting"
                      ? "Requesting..."
                      : "Enable"}
                  </button>
                )}
              </div>
              {permissionStatus.screen === "denied" && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Permission denied. Please enable in browser settings.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-2/3 bg-white dark:bg-card-dark border-l border-gray-200 dark:border-gray-700 p-6 lg:p-12"
        >
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            Exam Rules Notice
          </h2>

          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-6">
            <ul className="space-y-3">
              {rules.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-3 font-bold">•</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary mr-3"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                I agree to the exam rules
              </span>
            </label>
          </div>

          <button
            onClick={handleStartExam}
            disabled={!canStartExam}
            className={cn(
              "w-full py-4 rounded-lg font-semibold text-lg transition-colors",
              canStartExam
                ? "bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            )}
          >
            Start Exam
          </button>

          {!canStartExam && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Please enable all permissions and agree to the rules to start the exam
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}