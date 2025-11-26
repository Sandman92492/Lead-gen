/**
 * Haptic feedback utility for native-like vibrations
 * Works on mobile devices that support the Vibration API
 */

export const haptics = {
  /**
   * Light tap feedback - short, subtle vibration
   * Used for button taps, tab switches
   */
  tap: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium feedback - noticeable but not aggressive
   * Used for successful actions (redemption, purchase)
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 20, 10]);
    }
  },

  /**
   * Error feedback - stronger vibration pattern
   * Used for errors, warnings
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 10, 20, 10, 40]);
    }
  },

  /**
   * Heavy impact - strong single vibration
   * Used for critical actions, swipe completion
   */
  impact: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },
};
