import React from 'react';

type BadgeVariant = 'brand' | 'accent' | 'success' | 'danger' | 'neutral';
type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'bg-[var(--brand)] text-white',
  accent: 'bg-[var(--accent)] text-slate-900',
  success: 'bg-[var(--success)] text-white',
  danger: 'bg-[var(--danger)] text-white',
  neutral: 'bg-border-subtle text-text-primary',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold tracking-tight ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
};

export default Badge;

