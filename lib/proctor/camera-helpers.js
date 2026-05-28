/**
 * Webcam initialization layer for Next.js client components.
 * Keeps getUserMedia / video.play() separate from face-api model logic.
 */

import { stopMediaStream } from "@/lib/proctor/face-api-helpers";

const LOG_PREFIX = "[Proctor Camera]";

export const CAMERA_ERROR_CODES = {
  PERMISSION_DENIED: "permission_denied",
  NO_CAMERA: "no_camera",
  NOT_READABLE: "not_readable",
  UNSUPPORTED: "unsupported",
  UNKNOWN: "unknown",
};

export const CAMERA_ERROR_MESSAGES = {
  [CAMERA_ERROR_CODES.PERMISSION_DENIED]: "Camera permission blocked",
  [CAMERA_ERROR_CODES.NO_CAMERA]: "No camera found",
  [CAMERA_ERROR_CODES.NOT_READABLE]:
    "Camera is in use by another application",
  [CAMERA_ERROR_CODES.UNSUPPORTED]: "Camera is not supported in this browser",
  [CAMERA_ERROR_CODES.UNKNOWN]: "Could not start the camera",
};

export function logCameraStep(step, detail) {
  if (detail !== undefined) {
    console.log(LOG_PREFIX, step, detail);
  } else {
    console.log(LOG_PREFIX, step);
  }
}

export function mapCameraError(error) {
  const name = error?.name || "";
  const message = error?.message || "";

  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    message.toLowerCase().includes("permission")
  ) {
    return {
      code: CAMERA_ERROR_CODES.PERMISSION_DENIED,
      message: CAMERA_ERROR_MESSAGES[CAMERA_ERROR_CODES.PERMISSION_DENIED],
    };
  }

  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError" ||
    message.toLowerCase().includes("requested device not found")
  ) {
    return {
      code: CAMERA_ERROR_CODES.NO_CAMERA,
      message: CAMERA_ERROR_MESSAGES[CAMERA_ERROR_CODES.NO_CAMERA],
    };
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return {
      code: CAMERA_ERROR_CODES.NOT_READABLE,
      message: CAMERA_ERROR_MESSAGES[CAMERA_ERROR_CODES.NOT_READABLE],
    };
  }

  if (name === "NotSupportedError" || message.includes("not available")) {
    return {
      code: CAMERA_ERROR_CODES.UNSUPPORTED,
      message: CAMERA_ERROR_MESSAGES[CAMERA_ERROR_CODES.UNSUPPORTED],
    };
  }

  return {
    code: CAMERA_ERROR_CODES.UNKNOWN,
    message: CAMERA_ERROR_MESSAGES[CAMERA_ERROR_CODES.UNKNOWN],
  };
}

/**
 * Stops an existing stream before requesting a new one (avoids duplicate cameras).
 */
export function stopStreamRef(stream) {
  if (!stream) return;
  logCameraStep("Stopping previous MediaStream tracks");
  stopMediaStream(stream);
}

export async function requestWebcamStream(constraints) {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error("getUserMedia unavailable"), {
      name: "NotSupportedError",
    });
  }

  logCameraStep("Calling getUserMedia…");

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: { ideal: 640 },
      height: { ideal: 480 },
      ...(constraints?.video || {}),
    },
    ...constraints,
  });

  logCameraStep("getUserMedia success", {
    tracks: stream.getVideoTracks().map((t) => ({
      label: t.label,
      readyState: t.readyState,
    })),
  });

  return stream;
}

export async function bindStreamToVideo(videoEl, stream) {
  if (!videoEl) {
    throw new Error("Video element is not mounted");
  }

  logCameraStep("Attaching stream to video element");

  videoEl.srcObject = stream;
  videoEl.muted = true;
  videoEl.setAttribute("muted", "");
  videoEl.playsInline = true;
  videoEl.setAttribute("playsinline", "");
  videoEl.autoplay = true;

  logCameraStep("Stream attached (srcObject set)", {
    active: stream.active,
    videoTracks: stream.getVideoTracks().length,
  });

  try {
    await videoEl.play();
    logCameraStep("video.play() resolved", { paused: videoEl.paused });
  } catch (playErr) {
    logCameraStep("video.play() rejected — retry on loadedmetadata", playErr);
    await new Promise((resolve, reject) => {
      const onMeta = async () => {
        videoEl.removeEventListener("loadedmetadata", onMeta);
        try {
          await videoEl.play();
          logCameraStep("video.play() resolved after metadata", {
            paused: videoEl.paused,
          });
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      videoEl.addEventListener("loadedmetadata", onMeta);
    });
  }

  await waitForVideoElementReady(videoEl);

  logCameraStep("Video element ready", {
    videoWidth: videoEl.videoWidth,
    videoHeight: videoEl.videoHeight,
    readyState: videoEl.readyState,
    paused: videoEl.paused,
  });
}

export function waitForVideoElementReady(videoEl, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (!videoEl) {
      reject(new Error("Video element missing"));
      return;
    }

    const isReady = () =>
      videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      videoEl.videoWidth > 0;

    if (isReady()) {
      resolve(videoEl);
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Video did not become ready in time"));
    }, timeoutMs);

    const onReady = () => {
      if (isReady()) {
        cleanup();
        resolve(videoEl);
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      videoEl.removeEventListener("loadeddata", onReady);
      videoEl.removeEventListener("loadedmetadata", onReady);
      videoEl.removeEventListener("canplay", onReady);
    };

    videoEl.addEventListener("loadeddata", onReady);
    videoEl.addEventListener("loadedmetadata", onReady);
    videoEl.addEventListener("canplay", onReady);
  });
}

export function releaseVideoElement(videoEl) {
  if (!videoEl) return;
  logCameraStep("Releasing video element and stopping tracks");
  const stream = videoEl.srcObject;
  if (stream instanceof MediaStream) {
    stopMediaStream(stream);
  }
  videoEl.srcObject = null;
  videoEl.pause();
}
