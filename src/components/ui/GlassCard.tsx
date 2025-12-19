import React from 'react';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

const GlassCard: React.FC<GlassCardProps> = ({ className, padded = true, ...props }) => {
  return (
    <div className={`lw-glass-premium lw-tactile-card ${padded ? 'p-5' : ''} ${className || ''}`} {...props} />
  );
};

export default GlassCard;

