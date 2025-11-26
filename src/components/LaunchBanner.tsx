import React from 'react';

const LaunchBanner: React.FC = () => {
  return (
    <div className="sticky top-0 z-40 w-full bg-action-primary text-white py-4 px-4 text-center">
      <div className="font-semibold">🎉 Launching Dec 1st</div>
      <div className="text-sm opacity-90">Early Access • Features in Development</div>
    </div>
  );
};

export default LaunchBanner;
