import React, { useState, useEffect, useRef } from 'react';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  dealName: string;
  location?: string;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  dealName,
  location,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <>
      {/* Dark backdrop - tap to close */}
      <div
        className="fixed inset-0 bg-black/90 z-40"
        onClick={onClose}
      />

      {/* Full-screen modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-50 flex flex-col"
      >
          {/* Header with deal info */}
          <div className="bg-black/80 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-white font-bold text-lg sm:text-xl truncate">
                  {dealName}
                </h2>
                {location && (
                  <p className="text-gray-300 text-xs sm:text-sm truncate">
                    {location}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-3 text-white hover:text-gray-300 transition-colors p-3 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close gallery"
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Image carousel - centered */}
          <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 overflow-hidden">
            <div
              className="w-full h-full max-w-2xl"
            >
              <div className="relative h-full">
                <img
                  src={images[currentIndex]}
                  alt={`${dealName} image ${currentIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                
                {/* Left arrow */}
                {images.length > 1 && (
                  <button
                    onClick={() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors z-20 min-w-[48px] min-h-[48px] flex items-center justify-center"
                    aria-label="Previous image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                {/* Right arrow */}
                {images.length > 1 && (
                  <button
                    onClick={() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors z-20 min-w-[48px] min-h-[48px] flex items-center justify-center"
                    aria-label="Next image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer with image counter */}
          <div className="bg-black/80 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4">
            <p className="text-gray-300 text-sm">
              Image {currentIndex + 1} of {images.length}
            </p>
          </div>
          </div>
          </>
          );
};

export default ImageGalleryModal;
