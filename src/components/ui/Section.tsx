import React from 'react';

type SectionPadding = 'none' | 'sm' | 'md' | 'lg';

type SectionProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  padding?: SectionPadding;
};

const PADDING_CLASS: Record<SectionPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const Section: React.FC<SectionProps> = ({ className, padded = true, padding, ...props }) => {
  const paddingClass = padding ? PADDING_CLASS[padding] : padded ? 'p-5' : '';

  return (
    <div
      className={`bg-bg-card border border-border-subtle rounded-[18px] overflow-hidden shadow-md ${paddingClass} ${className || ''}`}
      {...props}
    />
  );
};

export default Section;
