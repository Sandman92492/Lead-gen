import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'whatsapp' | 'danger' | 'payment' | 'outline' | 'redeem' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseStyle =
    'relative inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-[var(--r-btn,16px)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeStyles = {
    sm: 'h-10 text-[11px] px-5',
    md: 'h-13 text-[13px] px-6',
    lg: 'h-16 text-[15px] px-8',
  };

  const variantStyles = {
    primary:
      'text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10',
    secondary:
      'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 shadow-sm',
    whatsapp:
      'text-white bg-[#25D366] hover:bg-[#1ebe5d] shadow-lg shadow-[#25D366]/20',
    danger:
      'text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20',
    payment:
      'bg-slate-900 text-white hover:bg-slate-800 shadow-xl',
    outline:
      'border-2 border-slate-200 text-text-primary bg-white hover:border-slate-900 transition-colors',
    redeem:
      'bg-slate-900 text-white hover:bg-slate-800 shadow-xl',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-primary/50',
  };

  return (
    <button className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
