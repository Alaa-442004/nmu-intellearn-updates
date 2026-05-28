/**
 * Proctor UI state machine — camera and models are independent pipelines.
 */

export const PROCTOR_PHASE = {
  IDLE: "idle",
  CAMERA_STARTING: "camera-starting",
  CAMERA_READY: "camera-ready",
  MODELS_LOADING: "models-loading",
  RUNNING: "running",
  ERROR: "error",
};

const DEFAULT_MESSAGES = {
  [PROCTOR_PHASE.IDLE]: "Proctor inactive",
  [PROCTOR_PHASE.CAMERA_STARTING]: "Starting camera…",
  [PROCTOR_PHASE.CAMERA_READY]: "Camera active — loading AI models…",
  [PROCTOR_PHASE.MODELS_LOADING]: "Loading AI models…",
  [PROCTOR_PHASE.RUNNING]: "Monitoring",
  [PROCTOR_PHASE.ERROR]: "Proctor error",
};

/**
 * Derives the single UI phase from parallel pipeline flags.
 * Camera never waits for models; models never block camera startup.
 */
export function computeProctorPhase({
  enabled,
  cameraError,
  modelError,
  cameraStarting,
  cameraReady,
  modelsLoading,
  modelsReady,
}) {
  if (!enabled) {
    return PROCTOR_PHASE.IDLE;
  }

  if (cameraError) {
    return PROCTOR_PHASE.ERROR;
  }

  if (cameraReady && modelsReady) {
    return PROCTOR_PHASE.RUNNING;
  }

  if (cameraReady && (modelsLoading || !modelsReady)) {
    return PROCTOR_PHASE.MODELS_LOADING;
  }

  if (cameraStarting || (!cameraReady && !cameraError)) {
    return PROCTOR_PHASE.CAMERA_STARTING;
  }

  if (cameraReady) {
    return PROCTOR_PHASE.CAMERA_READY;
  }

  if (modelError && !cameraReady) {
    return PROCTOR_PHASE.ERROR;
  }

  return PROCTOR_PHASE.CAMERA_STARTING;
}

/**
 * Human-readable status line for the header.
 */
export function getProctorStatusMessage(phase, { cameraError, modelError } = {}) {
  if (phase === PROCTOR_PHASE.ERROR) {
    return cameraError?.message || modelError?.message || DEFAULT_MESSAGES[phase];
  }
  if (phase === PROCTOR_PHASE.MODELS_LOADING && modelError) {
    return `Camera OK — ${modelError.message}`;
  }
  return DEFAULT_MESSAGES[phase] || DEFAULT_MESSAGES[PROCTOR_PHASE.IDLE];
}

export function logProctorState(label, detail) {
  if (detail !== undefined) {
    console.log("[Proctor State]", label, detail);
  } else {
    console.log("[Proctor State]", label);
  }
}

export function logModelStep(step, detail) {
  if (detail !== undefined) {
    console.log("[Proctor Models]", step, detail);
  } else {
    console.log("[Proctor Models]", step);
  }
}
