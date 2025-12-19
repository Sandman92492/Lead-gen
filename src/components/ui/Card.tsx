import React from 'react';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  padding?: CardPadding;
};

const PADDING_CLASS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const Card: React.FC<CardProps> = ({ className, padded = true, padding, ...props }) => {
  const paddingClass = padding ? PADDING_CLASS[padding] : padded ? 'p-5' : '';
  return (
    <div
      className={`lw-card relative ${paddingClass} ${className || ''}`}
      {...props}
    />
  );
};

export default Card;
