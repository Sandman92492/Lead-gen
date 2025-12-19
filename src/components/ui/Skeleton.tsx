import React from 'react';

type SkeletonProps = {
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return <div className={`lw-skeleton rounded-[16px] ${className || ''}`} aria-hidden="true" />;
};

export const SkeletonLeadCard: React.FC = () => {
  return (
    <div className="lw-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-12 w-12 rounded-[var(--r-lg)]" />
      </div>
    </div>
  );
};

export default Skeleton;

