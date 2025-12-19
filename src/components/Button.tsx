import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'whatsapp' | 'danger' | 'payment' | 'outline' | 'redeem' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseStyle =
    'relative inline-flex items-center justify-center gap-2 font-body font-semibold rounded-[var(--r-btn,12px)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'h-10 text-[13px] px-4',
    md: 'h-11 text-[14px] px-4.5',
    lg: 'h-12 text-[15px] px-6',
  };

  const variantStyles = {
    primary:
      'text-white bg-primary hover:bg-primary-pressed',
    secondary:
      'bg-white border border-border-subtle text-text-primary hover:border-primary hover:text-primary',
    whatsapp:
      'text-white bg-[#25D366] hover:bg-[#1ebe5d]',
    danger:
      'text-white bg-red-500 hover:bg-red-600',
    payment:
      'bg-primary text-white hover:bg-primary-pressed',
    outline:
      'border border-border-subtle text-text-primary bg-white hover:border-primary hover:text-primary',
    redeem:
      'bg-primary text-white hover:bg-primary-pressed',
    ghost:
      'bg-transparent text-text-secondary hover:text-primary',
  };

  return (
    <button className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
