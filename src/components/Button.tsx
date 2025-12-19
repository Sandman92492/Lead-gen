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
      'text-white bg-[#06B6B4] hover:brightness-110 shadow-lg shadow-[#06B6B4]/20',
    secondary:
      'bg-surface border border-border text-text-primary hover:bg-surface/80',
    whatsapp:
      'text-white bg-[#25D366] hover:brightness-95',
    danger:
      'text-white bg-red-500 hover:brightness-95',
    payment:
      'bg-accent text-slate-900 hover:brightness-95',
    outline:
      'border-2 border-primary text-primary bg-transparent hover:bg-primary/5',
    redeem:
      'bg-primary text-white hover:brightness-110',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface/50',
  };

  return (
    <button className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
