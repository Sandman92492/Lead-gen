import React, { useState, useRef } from 'react';

interface ImageCarouselProps {
    images: string[];
    alt: string;
    className?: string;
    heightClass?: string;
    dotsClass?: string;
    showDots?: boolean;
    showArrows?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
    images,
    alt,
    className = '',
    heightClass = 'h-full',
    dotsClass = 'absolute bottom-3 left-1/2 -translate-x-1/2',
    showDots = true,
    showArrows = true
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToSlide = (index: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(index);
    };

    if (!images || images.length === 0) {
        return (
            <div className={`bg-bg-primary border border-border-subtle ${heightClass} w-full flex items-center justify-center text-text-secondary`}>
                No Image
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <img
                src={images[0]}
                alt={alt}
                className={`w-full ${heightClass} object-cover ${className}`}
                loading="lazy"
                decoding="async"
            />
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative group w-full ${heightClass} ${className}`}
        >
            {/* Main Image */}
            <div className="w-full h-full overflow-hidden">
                <img
                    src={images[currentIndex]}
                    alt={`${alt} ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                />
            </div>

            {/* Navigation Arrows - Top corners */}
            {showArrows && images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevSlide();
                        }}
                        className="absolute left-2 sm:left-3 top-2 sm:top-3 text-white p-2 sm:p-3 
                            transition-all duration-300 z-20 opacity-70 hover:opacity-100 active:scale-95"
                        aria-label="Previous image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextSlide();
                        }}
                        className="absolute right-2 sm:right-3 top-2 sm:top-3 text-white p-2 sm:p-3 
                            transition-all duration-300 z-20 opacity-70 hover:opacity-100 active:scale-95"
                        aria-label="Next image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Dots Indicator & Arrow Hint */}
            {showDots && (
                <div className={`${dotsClass} flex flex-col items-center gap-2 z-20`}>
                    <div className="flex gap-1.5 px-2 py-1 rounded-full bg-black/20 backdrop-blur-[2px]">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => goToSlide(idx, e)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex
                                    ? 'bg-white w-4'
                                    : 'bg-white/60 hover:bg-white/90'
                                    }`}
                                aria-label={`Go to image ${idx + 1}`}
                            />
                        ))}
                    </div>
                    {images.length > 1 && (
                        <p className="text-xs sm:text-sm text-white/70 font-medium drop-shadow-md mt-1.5 px-2 whitespace-nowrap">
                            Use arrows to view images
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
