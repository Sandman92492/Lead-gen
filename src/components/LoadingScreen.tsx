import React from 'react';

const LoadingScreen: React.FC = () => {

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex items-center justify-center">
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-action-primary/20 overflow-hidden">
        <div 
          className="h-full bg-action-primary animate-pulse"
          style={{
            width: '70%',
            animation: 'indeterminate 1.5s ease-in-out infinite'
          }}
        />
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center gap-6">
        {/* Logo skeleton */}
        <div className="w-16 h-16 rounded-lg bg-bg-card animate-pulse" />
        
        {/* Text */}
        <div className="text-center">
          <p className="text-text-primary font-semibold mb-2">Loading your pass...</p>
          <p className="text-text-secondary text-sm">Just a moment</p>
        </div>

        {/* Spinner */}
        <div 
          className="w-8 h-8 border-2 border-action-primary/30 border-t-action-primary rounded-full"
          style={{
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100vw); }
          100% { transform: translateX(100vw); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
