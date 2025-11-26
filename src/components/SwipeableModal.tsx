import React, { useRef } from 'react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { haptics } from '../utils/haptics';

interface SwipeableModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Modal wrapper that supports swipe-down to close
 * Used for bottom sheets and full-screen modals
 */
const SwipeableModal: React.FC<SwipeableModalProps> = ({ children, isOpen, onClose, className = '' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useSwipeGesture(
    isOpen ? modalRef.current : null,
    {
      onSwipeDown: () => {
        if (isOpen) {
          haptics.impact();
          onClose();
        }
      },
    },
    40 // lower threshold for down swipes
  );

  return (
    <div
      ref={modalRef}
      className={className}
    >
      {children}
    </div>
  );
};

export default SwipeableModal;
