import React from 'react';

type CardVariant = 'card' | 'surface';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const variantClasses: Record<CardVariant, string> = {
  card: 'bg-bg-card',
  surface: 'bg-bg-primary',
};

const Card: React.FC<CardProps> = ({
  variant = 'card',
  padding = 'md',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`border border-border-subtle rounded-[var(--radius)] shadow-[var(--shadow)] ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    />
  );
};

export default Card;

