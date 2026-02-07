/**
 * Haptic Feedback Utility with Capacitor support
 * Provides vibration feedback for touch interactions
 */
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Light haptic feedback - for small interactions like checkbox toggles
 */
export async function hapticLight() {
  if (isNative) {
    await Haptics.impact({ style: ImpactStyle.Light });
  } else if (supportsVibration) {
    navigator.vibrate(10);
  }
}

/**
 * Medium haptic feedback - for button presses, selections
 */
export async function hapticMedium() {
  if (isNative) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } else if (supportsVibration) {
    navigator.vibrate(25);
  }
}

/**
 * Heavy haptic feedback - for important actions like delete, confirm
 */
export async function hapticHeavy() {
  if (isNative) {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } else if (supportsVibration) {
    navigator.vibrate(50);
  }
}

/**
 * Success haptic pattern - for successful operations
 */
export async function hapticSuccess() {
  if (isNative) {
    await Haptics.notification({ type: NotificationType.Success });
  } else if (supportsVibration) {
    navigator.vibrate([10, 50, 20]);
  }
}

/**
 * Error haptic pattern - for errors or warnings
 */
export async function hapticError() {
  if (isNative) {
    await Haptics.notification({ type: NotificationType.Error });
  } else if (supportsVibration) {
    navigator.vibrate([50, 30, 50]);
  }
}

/**
 * Selection changed haptic - for scrolling through options
 */
export async function hapticSelection() {
  if (isNative) {
    await Haptics.selectionChanged();
  } else if (supportsVibration) {
    navigator.vibrate(5);
  }
}
