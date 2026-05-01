const DEBUG_ENABLED =
  typeof process !== "undefined" &&
  process?.env?.EXPO_PUBLIC_ANIMATION_DEBUG === "1";

export function animationDebug(scope: string, message: string, data?: unknown) {
  if (!DEBUG_ENABLED) return;
  if (data !== undefined) {
    // eslint-disable-next-line no-console
    console.log(`[anim:${scope}] ${message}`, data);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[anim:${scope}] ${message}`);
  }
}

export function animationWarn(scope: string, message: string, data?: unknown) {
  if (data !== undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[anim:${scope}] ${message}`, data);
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[anim:${scope}] ${message}`);
  }
}
