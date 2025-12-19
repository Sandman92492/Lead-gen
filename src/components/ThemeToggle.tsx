import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

const IconSun = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 3v2M12 19v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const IconMoon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M21 13.2A7.5 7.5 0 0 1 10.8 3a6.9 6.9 0 1 0 10.2 10.2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`h-11 w-11 inline-flex items-center justify-center rounded-[14px] border border-border-subtle bg-bg-card/70 hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--ring)] ${className || ''}`}
      aria-label="Switch theme"
    >
      {theme === 'dark' ? <IconSun /> : <IconMoon />}
    </button>
  );
};

export default ThemeToggle;

