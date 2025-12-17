import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'payment' | 'outline' | 'redeem';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseStyle =
    'relative inline-flex items-center justify-center font-body font-semibold rounded-[calc(var(--radius)-4px)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-all duration-300 will-change-transform';

  const sizeStyles = {
    sm: 'text-sm px-4 py-2 md:py-1.5',
    md: 'text-base px-6 py-3 md:py-2.5',
    lg: 'text-lg px-8 py-3.5',
  };

  const variantStyles = {
    primary:
      'text-white bg-action-primary shadow-[0_18px_40px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 active:translate-y-0.5 hover:brightness-110',
    secondary:
      'bg-bg-card border border-border-subtle text-text-primary hover:border-action-primary/70 hover:text-text-primary/90 shadow-[0_12px_30px_rgba(15,23,42,0.12)]',
    payment:
      'bg-value-highlight text-slate-900 shadow-[0_18px_40px_rgba(245,158,11,0.24)] hover:-translate-y-0.5 hover:brightness-105',
    outline:
      'border border-action-primary text-action-primary bg-transparent hover:bg-action-primary/10 hover:text-text-primary',
    redeem:
      'bg-action-primary text-white shadow-[0_22px_50px_rgba(15,23,42,0.28)] hover:-translate-y-1 hover:brightness-110',
  };

  return (
    <button className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
