import React from 'react';

type BrandMarkProps = {
  className?: string;
  title?: string;
};

const BrandMark: React.FC<BrandMarkProps> = ({ className = 'w-9 h-9', title = 'Estate Pass' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={title}
    >
      <path
        d="M24 3l16 8v13c0 12-7.6 21.3-16 21.3S8 36 8 24V11l16-8Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M30.5 16.2H19.5c-1 0-1.8.8-1.8 1.8v12c0 1 .8 1.8 1.8 1.8h11"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28.8 23.9h-9.3"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="38" cy="10" r="7" fill="var(--color-alert)" />
      <text x="38" y="13" fontSize="8" fontWeight="900" textAnchor="middle" fill="white" fontFamily="sans-serif">V2</text>
    </svg>
  );
};

export default BrandMark;

