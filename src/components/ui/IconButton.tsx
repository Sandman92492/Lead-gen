import React from 'react';

type IconButtonVariant = 'ghost' | 'secondary' | 'primary';
type IconButtonSize = 'sm' | 'md';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
};

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-primary',
  secondary: 'bg-bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-primary',
  primary: 'bg-action-primary/10 text-action-primary hover:bg-action-primary/15',
};

const IconButton: React.FC<IconButtonProps> = ({ className, variant = 'ghost', size = 'md', ...props }) => {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-[12px] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${className || ''}`}
      {...props}
    />
  );
};

export default IconButton;
