/**
 * Haptic Feedback Utility
 * Provides vibration feedback for touch interactions
 */

// Check if vibration API is supported
const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Light haptic feedback - for small interactions like checkbox toggles
 */
export function hapticLight() {
  if (supportsVibration) {
    navigator.vibrate(10);
  }
}

/**
 * Medium haptic feedback - for button presses, selections
 */
export function hapticMedium() {
  if (supportsVibration) {
    navigator.vibrate(25);
  }
}

/**
 * Heavy haptic feedback - for important actions like delete, confirm
 */
export function hapticHeavy() {
  if (supportsVibration) {
    navigator.vibrate(50);
  }
}

/**
 * Success haptic pattern - for successful operations
 */
export function hapticSuccess() {
  if (supportsVibration) {
    navigator.vibrate([10, 50, 20]);
  }
}

/**
 * Error haptic pattern - for errors or warnings
 */
export function hapticError() {
  if (supportsVibration) {
    navigator.vibrate([50, 30, 50]);
  }
}

/**
 * Selection changed haptic - for scrolling through options
 */
export function hapticSelection() {
  if (supportsVibration) {
    navigator.vibrate(5);
  }
}

