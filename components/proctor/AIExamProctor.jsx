"use client";

/**
 * AIExamProctor — face-api.js proctor with stable camera + model pipelines.
 *
 * Architecture:
 * - Camera: starts immediately on mount (useLayoutEffect), independent of models
 * - Models: load in parallel (useEffect)
 * - Detection: requestAnimationFrame loop only when phase === "running"
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Camera, CameraOff, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  MODELS_BASE_PATH,
  createTinyFaceDetectorOptions,
  detectFacesInVideo,
  drawFaceBoxes,
  classifyFaceCount,
  loadTinyFaceDetectorModel,
} from "@/lib/proctor/face-api-helpers";
import {
  bindStreamToVideo,
  logCameraStep,
  mapCameraError,
  releaseVideoElement,
  requestWebcamStream,
  stopStreamRef,
} from "@/lib/proctor/camera-helpers";
import {
  INTEGRITY_MESSAGES,
  INTEGRITY_TYPES,
  incrementStreak,
  resetStreak,
  watchFullscreen,
  watchTabVisibility,
} from "@/lib/proctor/integrity-helpers";
import {
  PROCTOR_PHASE,
  computeProctorPhase,
  getProctorStatusMessage,
  logModelStep,
  logProctorState,
} from "@/lib/proctor/proctor-state-machine";

const DEFAULT_DETECTION_INTERVAL_MS = 120;
const DEFAULT_NO_FACE_THRESHOLD = 12;
const DEFAULT_MULTI_FACE_THRESHOLD = 8;

export default function AIExamProctor({
  enabled = true,
  showPreview = true,
  modelsPath = MODELS_BASE_PATH,
  detectionIntervalMs = DEFAULT_DETECTION_INTERVAL_MS,
  noFaceFrameThreshold = DEFAULT_NO_FACE_THRESHOLD,
  multiFaceFrameThreshold = DEFAULT_MULTI_FACE_THRESHOLD,
  monitorFullscreen = true,
  monitorTabSwitch = true,
  autoRequestFullscreen = false,
  className,
  onWarning,
  onViolation,
  onReady,
  onError,
}) {
  // ─── Stable DOM refs (never recreated) ───
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // ─── Pipeline refs (no re-renders) ───
  const streamRef = useRef(null);
  const faceapiRef = useRef(null);
  const detectorOptionsRef = useRef(null);
  const rafRef = useRef(null);
  const mountedRef = useRef(false);
  const detectingRef = useRef(false);
  const lastDetectAtRef = useRef(0);

  /** Guards duplicate getUserMedia (Strict Mode / ref churn) */
  const cameraSessionRef = useRef(0);
  const cameraInFlightRef = useRef(false);
  const cameraActiveRef = useRef(false);
  const modelsSessionRef = useRef(0);

  const modelsReadyRef = useRef(false);
  const readyNotifiedRef = useRef(false);
  const prevEnabledRef = useRef(enabled);

  const noFaceStreakRef = useRef(0);
  const multiFaceStreakRef = useRef(0);
  const wasFullscreenRef = useRef(false);
  const violationSentRef = useRef({
    [INTEGRITY_TYPES.NO_FACE]: false,
    [INTEGRITY_TYPES.MULTIPLE_FACES]: false,
    [INTEGRITY_TYPES.FULLSCREEN_EXIT]: false,
    [INTEGRITY_TYPES.TAB_SWITCH]: false,
  });

  // ─── Pipeline flags (drive state machine) ───
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [modelError, setModelError] = useState(null);

  const [faceCount, setFaceCount] = useState(0);
  const [activeWarning, setActiveWarning] = useState(null);

  const phase = useMemo(
    () =>
      computeProctorPhase({
        enabled,
        cameraError,
        modelError,
        cameraStarting,
        cameraReady,
        modelsLoading,
        modelsReady,
      }),
    [
      enabled,
      cameraError,
      modelError,
      cameraStarting,
      cameraReady,
      modelsLoading,
      modelsReady,
    ]
  );

  const statusMessage = useMemo(
    () => getProctorStatusMessage(phase, { cameraError, modelError }),
    [phase, cameraError, modelError]
  );

  // Keep ref in sync for async camera callback
  useEffect(() => {
    modelsReadyRef.current = modelsReady;
  }, [modelsReady]);

  // Log phase transitions
  useEffect(() => {
    logProctorState("phase", phase);
  }, [phase]);

  const emitWarning = useCallback(
    (type, message) => {
      setActiveWarning({ type, message });
      onWarning?.(type, message);
    },
    [onWarning]
  );

  const emitViolation = useCallback(
    (type, message) => {
      if (violationSentRef.current[type]) return;
      violationSentRef.current[type] = true;
      setActiveWarning({ type, message });
      onViolation?.(type, message);
    },
    [onViolation]
  );

  const clearWarningIfOk = useCallback(() => {
    setActiveWarning(null);
  }, []);

  /** Stop camera stream and reset camera flags */
  const teardownCamera = useCallback(() => {
    cameraInFlightRef.current = false;
    cameraActiveRef.current = false;
    releaseVideoElement(videoRef.current);
    streamRef.current = null;
    setCameraStarting(false);
    setCameraReady(false);
    setCameraError(null);
    logCameraStep("Camera teardown complete");
  }, []);

  /** Stop models flag only (face-api nets stay in memory until page unload) */
  const resetModelFlags = useCallback(() => {
    setModelsLoading(false);
    setModelsReady(false);
    modelsReadyRef.current = false;
    setModelError(null);
    logModelStep("Model flags reset");
  }, []);

  // ─── CAMERA PIPELINE: mount immediately, never wait for models ───
  useLayoutEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      return undefined;
    }

    const session = ++cameraSessionRef.current;
    let retryRaf = null;

    async function startCameraOnce() {
      const video = videoRef.current;

      if (!video) {
        logCameraStep("Video ref not ready — scheduling retry");
        retryRaf = requestAnimationFrame(() => {
          if (session !== cameraSessionRef.current || !mountedRef.current) return;
          startCameraOnce();
        });
        return;
      }

      if (cameraInFlightRef.current || cameraActiveRef.current) {
        logCameraStep("Camera start skipped (already active or in flight)");
        return;
      }

      cameraInFlightRef.current = true;
      setCameraStarting(true);
      setCameraError(null);
      logCameraStep("Camera pipeline starting", { session });

      try {
        if (streamRef.current) {
          stopStreamRef(streamRef.current);
          streamRef.current = null;
        }

        const stream = await requestWebcamStream();

        if (session !== cameraSessionRef.current || !mountedRef.current) {
          stopStreamRef(stream);
          return;
        }

        streamRef.current = stream;
        await bindStreamToVideo(video, stream);

        if (session !== cameraSessionRef.current || !mountedRef.current) {
          stopStreamRef(stream);
          return;
        }

        cameraActiveRef.current = true;
        setCameraReady(true);
        setCameraStarting(false);
        logCameraStep("Camera start success", {
          session,
          modelsReady: modelsReadyRef.current,
        });
      } catch (err) {
        if (session !== cameraSessionRef.current || !mountedRef.current) return;

        const mapped = mapCameraError(err);
        logCameraStep("Camera start failure", mapped);
        setCameraError(mapped);
        setCameraStarting(false);
        setCameraReady(false);
        cameraActiveRef.current = false;
        onError?.(err instanceof Error ? err : new Error(mapped.message));
      } finally {
        cameraInFlightRef.current = false;
      }
    }

    startCameraOnce();

    return () => {
      if (retryRaf) cancelAnimationFrame(retryRaf);
      cameraSessionRef.current += 1;
      teardownCamera();
    };
  }, [enabled, teardownCamera, onError]);

  // ─── MODEL PIPELINE: parallel, non-blocking for camera ───
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const session = ++modelsSessionRef.current;
    let cancelled = false;

    (async () => {
      try {
        setModelsLoading(true);
        setModelError(null);
        logModelStep("Loading started", { session });

        const faceapi = await import("face-api.js");
        if (cancelled || session !== modelsSessionRef.current) return;

        faceapiRef.current = faceapi;
        detectorOptionsRef.current = createTinyFaceDetectorOptions(faceapi);

        await loadTinyFaceDetectorModel(faceapi, modelsPath);
        if (cancelled || session !== modelsSessionRef.current) return;

        modelsReadyRef.current = true;
        setModelsReady(true);
        setModelsLoading(false);
        logModelStep("Loading success", {
          session,
          cameraReady: cameraActiveRef.current,
        });
      } catch (err) {
        if (cancelled || session !== modelsSessionRef.current) return;

        const message =
          err instanceof Error ? err.message : "Failed to load AI models";
        logModelStep("Loading failure", { session, message });
        setModelError({ message });
        setModelsReady(false);
        modelsReadyRef.current = false;
        setModelsLoading(false);
        onError?.(err instanceof Error ? err : new Error(message));
      }
    })();

    return () => {
      cancelled = true;
      modelsSessionRef.current += 1;
      resetModelFlags();
    };
  }, [enabled, modelsPath, onError, resetModelFlags]);

  // ─── onReady: fire once per enabled session when entering RUNNING ───
  useEffect(() => {
    if (phase === PROCTOR_PHASE.RUNNING && !readyNotifiedRef.current) {
      readyNotifiedRef.current = true;
      logProctorState("Proctor ready — detection enabled");
      onReady?.();
    }
  }, [phase, onReady]);

  // ─── Reset ready notification only when user disables proctor ───
  useEffect(() => {
    if (prevEnabledRef.current && !enabled) {
      readyNotifiedRef.current = false;
      logProctorState("Proctor disabled by enabled=false");
    }
    prevEnabledRef.current = enabled;
  }, [enabled]);

  // ─── Full teardown when disabled (no "paused" while still enabled) ───
  useEffect(() => {
    if (enabled) return undefined;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    cameraSessionRef.current += 1;
    modelsSessionRef.current += 1;
    teardownCamera();
    resetModelFlags();
    setFaceCount(0);
    setActiveWarning(null);
    detectingRef.current = false;

    return undefined;
  }, [enabled, teardownCamera, resetModelFlags]);

  useEffect(() => {
    if (!enabled || !autoRequestFullscreen || !containerRef.current) return undefined;
    containerRef.current.requestFullscreen?.().catch(() => {});
    return undefined;
  }, [enabled, autoRequestFullscreen]);

  useEffect(() => {
    if (!enabled) return undefined;

    const cleanups = [];

    if (monitorFullscreen) {
      cleanups.push(
        watchFullscreen((isFullscreen) => {
          if (isFullscreen) {
            wasFullscreenRef.current = true;
            return;
          }
          if (wasFullscreenRef.current) {
            emitWarning(
              INTEGRITY_TYPES.FULLSCREEN_EXIT,
              INTEGRITY_MESSAGES[INTEGRITY_TYPES.FULLSCREEN_EXIT]
            );
            emitViolation(
              INTEGRITY_TYPES.FULLSCREEN_EXIT,
              INTEGRITY_MESSAGES[INTEGRITY_TYPES.FULLSCREEN_EXIT]
            );
          }
        })
      );
    }

    if (monitorTabSwitch) {
      cleanups.push(
        watchTabVisibility((hidden) => {
          if (!hidden) return;
          emitWarning(
            INTEGRITY_TYPES.TAB_SWITCH,
            INTEGRITY_MESSAGES[INTEGRITY_TYPES.TAB_SWITCH]
          );
          emitViolation(
            INTEGRITY_TYPES.TAB_SWITCH,
            INTEGRITY_MESSAGES[INTEGRITY_TYPES.TAB_SWITCH]
          );
        })
      );
    }

    return () => cleanups.forEach((fn) => fn());
  }, [enabled, monitorFullscreen, monitorTabSwitch, emitWarning, emitViolation]);

  // ─── Detection loop (face-api logic unchanged) ───
  useEffect(() => {
    if (!enabled || phase !== PROCTOR_PHASE.RUNNING) {
      return undefined;
    }

    logProctorState("Detection loop started");

    const tick = (now) => {
      if (!mountedRef.current) return;

      const elapsed = now - lastDetectAtRef.current;
      if (elapsed >= detectionIntervalMs && !detectingRef.current) {
        lastDetectAtRef.current = now;
        runDetection();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    async function runDetection() {
      const faceapi = faceapiRef.current;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const options = detectorOptionsRef.current;

      if (!faceapi || !video || !options) return;

      detectingRef.current = true;

      try {
        const detections = await detectFacesInVideo(video, faceapi, options);
        if (!mountedRef.current) return;

        drawFaceBoxes(canvas, detections, faceapi, video);

        const count = detections.length;
        setFaceCount(count);

        const status = classifyFaceCount(count);

        if (status === "ok") {
          noFaceStreakRef.current = resetStreak();
          multiFaceStreakRef.current = resetStreak();
          violationSentRef.current[INTEGRITY_TYPES.NO_FACE] = false;
          violationSentRef.current[INTEGRITY_TYPES.MULTIPLE_FACES] = false;
          clearWarningIfOk();
          return;
        }

        if (status === "no_face") {
          multiFaceStreakRef.current = resetStreak();
          const { count: streak, triggered } = incrementStreak(
            noFaceStreakRef.current,
            noFaceFrameThreshold
          );
          noFaceStreakRef.current = streak;
          const message = INTEGRITY_MESSAGES[INTEGRITY_TYPES.NO_FACE];
          emitWarning(INTEGRITY_TYPES.NO_FACE, message);
          if (triggered) emitViolation(INTEGRITY_TYPES.NO_FACE, message);
          return;
        }

        if (status === "multiple_faces") {
          noFaceStreakRef.current = resetStreak();
          const { count: streak, triggered } = incrementStreak(
            multiFaceStreakRef.current,
            multiFaceFrameThreshold
          );
          multiFaceStreakRef.current = streak;
          const message = INTEGRITY_MESSAGES[INTEGRITY_TYPES.MULTIPLE_FACES];
          emitWarning(INTEGRITY_TYPES.MULTIPLE_FACES, message);
          if (triggered) emitViolation(INTEGRITY_TYPES.MULTIPLE_FACES, message);
        }
      } catch {
        /* skip frame */
      } finally {
        detectingRef.current = false;
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      logProctorState("Detection loop stopped");
    };
  }, [
    enabled,
    phase,
    detectionIntervalMs,
    noFaceFrameThreshold,
    multiFaceFrameThreshold,
    emitWarning,
    emitViolation,
    clearWarningIfOk,
  ]);

  // ─── Unmount cleanup ───
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cameraSessionRef.current += 1;
      modelsSessionRef.current += 1;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      teardownCamera();
      detectingRef.current = false;
      logProctorState("Component unmounted — all resources released");
    };
  }, [teardownCamera]);

  const statusColor =
    faceCount === 1
      ? "text-green-600 dark:text-green-400"
      : faceCount === 0
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const isRunning = phase === PROCTOR_PHASE.RUNNING;
  const isError = phase === PROCTOR_PHASE.ERROR;
  const showCameraFeed = cameraReady && !cameraError;
  const showSpinnerOverlay =
    enabled && !isError && !showCameraFeed && phase !== PROCTOR_PHASE.IDLE;

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 min-w-0">
          {isRunning && faceCount === 1 ? (
            <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
          ) : isError ? (
            <CameraOff className="w-5 h-5 text-red-500 shrink-0" />
          ) : enabled ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          ) : (
            <Camera className="w-5 h-5 text-gray-400 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              AI Exam Proctor
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {statusMessage}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={cn("text-lg font-bold tabular-nums", statusColor)}>
            {isRunning ? faceCount : "—"}
          </p>
          <p className="text-xs text-gray-500">faces</p>
        </div>
      </div>

      {cameraError && (
        <div
          role="alert"
          className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 text-red-800 dark:text-red-200"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{cameraError.message}</p>
        </div>
      )}

      {modelError && !cameraError && (
        <div
          role="alert"
          className="flex items-start gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">
            Models: {modelError.message} (camera still active)
          </p>
        </div>
      )}

      {activeWarning && !cameraError && (
        <div
          role="alert"
          className="flex items-start gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{activeWarning.message}</p>
        </div>
      )}

      <div
        className={cn(
          "relative bg-gray-950 w-full mx-auto",
          showPreview
            ? "aspect-video max-h-[min(70vh,480px)] max-w-3xl"
            : "fixed w-px h-px opacity-0 pointer-events-none overflow-hidden"
        )}
      >
        <video
          ref={videoRef}
          className={cn(
            "w-full h-full object-cover -scale-x-100",
            showPreview ? "block" : "absolute"
          )}
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 w-full h-full object-cover pointer-events-none -scale-x-100",
            !showPreview && "sr-only"
          )}
          aria-hidden="true"
        />

        {showSpinnerOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900/80">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-sm text-gray-300">{statusMessage}</p>
          </div>
        )}

        {isError && cameraError && showPreview && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 px-4">
            <div className="text-center">
              <CameraOff className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-200 font-medium">{cameraError.message}</p>
            </div>
          </div>
        )}

        {showCameraFeed && showPreview && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live
            {phase === PROCTOR_PHASE.MODELS_LOADING && (
              <span className="text-gray-300">· loading models</span>
            )}
          </div>
        )}
      </div>

      <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 text-center sm:text-left">
        {phase} · TinyFaceDetector · {detectionIntervalMs}ms · {modelsPath}
      </p>
    </div>
  );
}
