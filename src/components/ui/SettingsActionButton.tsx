import React from 'react';

type SettingsActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

const SettingsActionButton: React.FC<SettingsActionButtonProps> = ({ className, variant = 'primary', ...props }) => {
  const base =
    'h-12 w-full inline-flex items-center justify-center rounded-[var(--r-lg)] px-5 text-[15px] font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--ring)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<NonNullable<SettingsActionButtonProps['variant']>, string> = {
    primary: 'bg-action-primary text-white hover:brightness-105 active:brightness-95',
    secondary: 'bg-bg-card text-text-primary border border-border-subtle hover:bg-bg-primary/60 active:bg-bg-primary/80',
    danger: 'bg-alert text-white hover:brightness-105 active:brightness-95',
  };

  return <button type="button" className={`${base} ${variants[variant]} ${className || ''}`} {...props} />;
};

export default SettingsActionButton;
