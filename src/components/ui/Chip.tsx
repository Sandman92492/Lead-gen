import React from 'react';

type ChipVariant = 'muted' | 'primary' | 'success' | 'danger';

type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: ChipVariant;
};

const variantClasses: Record<ChipVariant, string> = {
  muted: 'bg-[var(--badge-muted-bg)] text-[var(--badge-muted-text)]',
  primary: 'bg-action-primary/10 text-action-primary',
  success: 'bg-success/12 text-success',
  danger: 'bg-alert/10 text-alert',
};

const Chip: React.FC<ChipProps> = ({ className, variant = 'muted', ...props }) => {
  return (
    <span
      className={`inline-flex items-center justify-center h-6 px-2.5 rounded-full text-[11px] leading-4 font-semibold whitespace-nowrap ${
        variantClasses[variant]
      } ${className || ''}`}
      {...props}
    />
  );
};

export default Chip;
