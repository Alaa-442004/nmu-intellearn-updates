/**
 * Browser integrity helpers: fullscreen exit and tab visibility.
 * Used alongside face detection during exams.
 */

/** Violation / warning type constants for parent callbacks */
export const INTEGRITY_TYPES = {
  NO_FACE: "no_face",
  MULTIPLE_FACES: "multiple_faces",
  FULLSCREEN_EXIT: "fullscreen_exit",
  TAB_SWITCH: "tab_switch",
};

export const INTEGRITY_MESSAGES = {
  [INTEGRITY_TYPES.NO_FACE]: "No face detected. Please stay in frame.",
  [INTEGRITY_TYPES.MULTIPLE_FACES]:
    "Multiple faces detected. Only one person may take the exam.",
  [INTEGRITY_TYPES.FULLSCREEN_EXIT]:
    "Fullscreen was exited. Return to fullscreen to continue.",
  [INTEGRITY_TYPES.TAB_SWITCH]:
    "Tab switch detected. Keep the exam window focused.",
};

/**
 * Registers fullscreenchange listener.
 * @param {(isFullscreen: boolean) => void} onChange
 * @returns {() => void} cleanup
 */
export function watchFullscreen(onChange) {
  if (typeof document === "undefined") return () => {};

  const handler = () => {
    onChange(Boolean(document.fullscreenElement));
  };

  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);

  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler);
  };
}

/**
 * Registers Page Visibility API listener (tab switch / minimize).
 * @param {(isHidden: boolean) => void} onVisibilityChange
 * @returns {() => void} cleanup
 */
export function watchTabVisibility(onVisibilityChange) {
  if (typeof document === "undefined") return () => {};

  const handler = () => {
    onVisibilityChange(document.hidden);
  };

  document.addEventListener("visibilitychange", handler);

  return () => {
    document.removeEventListener("visibilitychange", handler);
  };
}

/**
 * Heuristic DevTools / docked panel detection (optional extra check).
 * Not enabled by default in the proctor component — available for extension.
 */
export function isDevToolsLikelyOpen(threshold = 160) {
  if (typeof window === "undefined") return false;
  return (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  );
}

/**
 * Increments a streak counter; returns true when threshold is reached.
 * Used to avoid flashing warnings on single missed frames.
 */
export function incrementStreak(current, threshold) {
  const next = current + 1;
  return { count: next, triggered: next >= threshold };
}

/** Resets streak when condition is healthy again */
export function resetStreak() {
  return 0;
}
