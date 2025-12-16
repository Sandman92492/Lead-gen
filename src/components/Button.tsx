import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'payment' | 'outline' | 'redeem';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const baseStyle =
    "font-body font-bold rounded-[calc(var(--radius)-8px)] focus:outline-none focus:ring-4 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] transition-all duration-300 transform hover:brightness-105";
  
  const sizeStyles = {
    sm: "px-4 py-2 md:py-1.5 text-sm",
    md: "px-6 py-3 md:py-2.5 text-base",
    lg: "px-8 py-4 md:py-3.5 text-lg",
  };

  const variantStyles = {
    primary: "bg-[var(--brand)] text-white hover:brightness-110",
    secondary: "border-2 border-action-primary text-action-primary bg-transparent hover:bg-action-primary/10",
    payment: "bg-[var(--accent)] text-slate-900 font-bold hover:brightness-110",
    outline: "border-2 border-action-primary text-action-primary bg-transparent hover:bg-action-primary/10",
    redeem: "bg-urgency-high text-white hover:brightness-110",
  };

  return (
    <button className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
