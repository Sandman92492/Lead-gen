import { useEffect, useRef } from 'react';

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
}

interface SwipeOptions {
  threshold?: number;
  directionRatio?: number; // Require N times more delta in primary direction (default 1.5)
}

/**
 * Hook for detecting swipe gestures on touch devices
 * Does NOT trigger haptic feedback - use haptics.tap() in callbacks if desired
 * 
 * @param element - DOM element to attach listeners to
 * @param callbacks - Swipe direction callbacks
 * @param threshold - Distance threshold in px (default: 50, or 30 on mobile)
 * @param directionRatio - Require primary direction to be N times larger (default: 1.5)
 */
export const useSwipeGesture = (
  element: HTMLElement | null,
  callbacks: SwipeCallbacks,
  threshold?: number | SwipeOptions
) => {
  const touchStart = useRef({ x: 0, y: 0 });
  
  // Parse arguments for backward compatibility
  const options: SwipeOptions = typeof threshold === 'number' ? { threshold } : threshold || {};
  const finalThreshold = options.threshold ?? 50;
  const directionRatio = options.directionRatio ?? 1.5;

  useEffect(() => {
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      const deltaX = touchEnd.x - touchStart.current.x;
      const deltaY = touchEnd.y - touchStart.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Swipe must be primarily horizontal or vertical (require directionRatio bias)
      // e.g., if directionRatio = 1.5, horizontal swipe needs absDeltaX > absDeltaY * 1.5
      const isHorizontal = absDeltaX > absDeltaY * directionRatio;
      const isVertical = absDeltaY > absDeltaX * directionRatio;

      if (isHorizontal && absDeltaX > finalThreshold) {
        if (deltaX > 0) {
          // Swiped right
          callbacks.onSwipeRight?.();
        } else {
          // Swiped left
          callbacks.onSwipeLeft?.();
        }
      } else if (isVertical && absDeltaY > finalThreshold) {
        if (deltaY > 0) {
          // Swiped down
          callbacks.onSwipeDown?.();
        } else {
          // Swiped up
          callbacks.onSwipeUp?.();
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, false);
    element.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart, false);
      element.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [element, callbacks, finalThreshold, directionRatio]);
};
