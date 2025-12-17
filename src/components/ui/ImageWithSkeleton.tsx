import React, { useMemo, useState } from 'react';

type ImageWithSkeletonProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  skeletonClassName?: string;
  fallbackClassName?: string;
  loading?: 'eager' | 'lazy';
};

const normalizeAssetUrl = (raw: string): string => {
  const value = raw.trim();
  if (!value) return value;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith('/')) return value;
  return `/${value}`;
};

const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  skeletonClassName = '',
  fallbackClassName = '',
  loading = 'lazy',
}) => {
  const normalizedSrc = useMemo(() => normalizeAssetUrl(src), [src]);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={`relative ${className}`}>
      {state !== 'loaded' && (
        <div className={`absolute inset-0 animate-pulse bg-bg-primary ${skeletonClassName}`} aria-hidden="true" />
      )}

      {state !== 'error' ? (
        <img
          src={normalizedSrc}
          alt={alt}
          loading={loading}
          className={`${imgClassName} ${state === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      ) : (
        <div className={`absolute inset-0 grid place-items-center bg-bg-primary text-text-secondary ${fallbackClassName}`} aria-label="Image unavailable">
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M8 13l2-2 3 3 2-2 3 3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ImageWithSkeleton;
