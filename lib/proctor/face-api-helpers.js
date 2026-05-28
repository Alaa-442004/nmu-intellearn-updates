/**
 * face-api.js helpers for browser-only exam proctoring.
 * Import face-api dynamically in client components — never on the server.
 */

/** Default folder under /public — served as /models in the browser */
export const MODELS_BASE_PATH = "/models";

/** Balanced speed vs accuracy for live webcam (multiple of 32) */
export const DEFAULT_INPUT_SIZE = 320;

/** Minimum confidence to count a detection (0–1) */
export const DEFAULT_SCORE_THRESHOLD = 0.5;

/**
 * Loads only the Tiny Face Detector (smallest, fastest model).
 * @param {typeof import('face-api.js')} faceapi - Dynamically imported face-api module
 * @param {string} [basePath] - URI prefix, e.g. "/models"
 */
export async function loadTinyFaceDetectorModel(faceapi, basePath = MODELS_BASE_PATH) {
  const uri = basePath.replace(/\/$/, "");
  await faceapi.nets.tinyFaceDetector.loadFromUri(uri);
}

/**
 * TinyFaceDetectorOptions — required detector settings per product spec.
 * @param {typeof import('face-api.js')} faceapi
 * @param {{ inputSize?: number, scoreThreshold?: number }} [overrides]
 */
export function createTinyFaceDetectorOptions(faceapi, overrides = {}) {
  return new faceapi.TinyFaceDetectorOptions({
    inputSize: overrides.inputSize ?? DEFAULT_INPUT_SIZE,
    scoreThreshold: overrides.scoreThreshold ?? DEFAULT_SCORE_THRESHOLD,
  });
}

/**
 * Runs face detection on a video element (single frame).
 * @returns {Promise<import('face-api.js').FaceDetection[]>}
 */
export async function detectFacesInVideo(videoEl, faceapi, detectorOptions) {
  if (!videoEl || videoEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return [];
  }
  return faceapi.detectAllFaces(videoEl, detectorOptions);
}

/**
 * Matches canvas pixel size to the video frame for crisp overlay drawing.
 */
export function syncCanvasToVideo(canvas, video) {
  if (!canvas || !video) return;
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
    canvas.width = w;
    canvas.height = h;
  }
}

/**
 * Clears canvas and draws bounding boxes for each detection.
 */
export function drawFaceBoxes(canvas, detections, faceapi, video) {
  if (!canvas || !video) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  syncCanvasToVideo(canvas, video);

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!detections || detections.length === 0) return;

  const resized = faceapi.resizeResults(detections, displaySize);
  faceapi.draw.drawDetections(canvas, resized);
}

/**
 * Requests front-facing webcam with sensible defaults for proctoring.
 * @returns {Promise<MediaStream>}
 */
export async function openWebcam(constraints = {}) {
  const { requestWebcamStream } = await import("@/lib/proctor/camera-helpers");
  return requestWebcamStream(constraints);
}

/**
 * Stops every track on a MediaStream to release the camera (prevents leaks).
 */
export function stopMediaStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      /* already stopped */
    }
  });
}

/**
 * Detaches stream from a video element and clears srcObject.
 */
export function detachVideoElement(videoEl) {
  if (!videoEl) return;
  const stream = videoEl.srcObject;
  if (stream instanceof MediaStream) {
    stopMediaStream(stream);
  }
  videoEl.srcObject = null;
  videoEl.pause();
}

/**
 * Waits until video metadata is ready and has non-zero dimensions.
 */
export function waitForVideoReady(videoEl, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (!videoEl) {
      reject(new Error("Video element missing"));
      return;
    }

    if (videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && videoEl.videoWidth > 0) {
      resolve(videoEl);
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Camera video did not become ready in time."));
    }, timeoutMs);

    const onReady = () => {
      if (videoEl.videoWidth > 0) {
        cleanup();
        resolve(videoEl);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      videoEl.removeEventListener("loadeddata", onReady);
      videoEl.removeEventListener("loadedmetadata", onReady);
    };

    videoEl.addEventListener("loadeddata", onReady);
    videoEl.addEventListener("loadedmetadata", onReady);
  });
}

/**
 * Classifies detection count into proctor status for UI and callbacks.
 */
export function classifyFaceCount(faceCount) {
  if (faceCount === 0) return "no_face";
  if (faceCount === 1) return "ok";
  return "multiple_faces";
}
