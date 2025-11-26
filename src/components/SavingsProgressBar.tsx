import React, { useEffect } from 'react';
import { PassType } from '../types';
import { useTotalSavings } from '../hooks/useTotalSavings';

interface SavingsProgressBarProps {
  passType: PassType;
  redeemedDeals?: string[];
  totalSavings?: number; // Optional for backwards compatibility
  purchasePrice?: number; // Actual price paid in Rands
}

const SavingsProgressBar: React.FC<SavingsProgressBarProps> = ({ redeemedDeals = [], totalSavings: providedSavings, purchasePrice }) => {
  const { totalSavings: calculatedSavings } = useTotalSavings(redeemedDeals);
  const totalSavings = providedSavings !== undefined ? providedSavings : calculatedSavings;
  // Use actual purchase price if provided, fallback to current pricing
  const passCost = purchasePrice || 199;
  const progressPercent = Math.min((totalSavings / passCost) * 100, 100);
  
  // Log when data updates for debugging
  useEffect(() => {
    console.log('🔄 SavingsProgressBar data updated:', { redeemedDeals, calculatedSavings, totalSavings, passCost, purchasePrice, progressPercent });
  }, [redeemedDeals, totalSavings, calculatedSavings, passCost, purchasePrice, progressPercent]);
  const isExceeded = totalSavings >= passCost;
  const remaining = Math.max(passCost - totalSavings, 0);
  const multiplier = isExceeded ? (totalSavings / passCost).toFixed(1) : null;

  const getMessage = () => {
    if (isExceeded) {
      return <span>You've earned back <span className="text-urgency-high font-bold">{multiplier}x</span> your pass cost!</span>;
    }
    if (totalSavings >= passCost * 0.75) {
      return <span>You're almost there! <span className="text-urgency-high font-bold">R{remaining}</span> away from breaking even.</span>;
    }
    if (totalSavings >= passCost * 0.5) {
      return <span>Halfway there! <span className="text-urgency-high font-bold">R{remaining}</span> more to earn back your investment.</span>;
    }
    return <span>Earn back <span className="text-urgency-high font-bold">R{remaining}</span> more to cover your pass cost.</span>;
  };

  return (
    <div className="w-full space-y-3">
      {/* Savings Amount */}
       <div className="text-center">
         <div className="text-6xl font-display font-black bg-gradient-to-r from-value-highlight to-action-primary bg-clip-text text-transparent">
           R{totalSavings}
         </div>
         <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-2">
           Total Savings So Far
         </p>
       </div>

      {/* Progress Bar */}
       <div className="space-y-2">
         <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-sm">
           <div
             className={`h-full transition-all duration-500 ease-out rounded-full ${isExceeded ? 'animate-pulse' : ''}`}
             style={{
               width: `${progressPercent}%`,
               backgroundColor: 'var(--color-value-highlight)'
             }}
           />
           {/* Breakeven marker line at 100% */}
           <div
             className="absolute top-0 bottom-0 w-0.5 bg-gray-400 dark:bg-gray-500"
             style={{ left: '100%', transform: 'translateX(-50%)' }}
             title="Breakeven point"
           />
         </div>
         <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
           <span>R0</span>
           <span>R{passCost}</span>
         </div>
       </div>

      {/* Motivational Message */}
      <p className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">
        {getMessage()}
      </p>

      {/* Celebration indicator when exceeded */}
      {isExceeded && (
        <div className="flex justify-center gap-2 mt-3">
          <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>
            🎉
          </span>
          <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>
            🎊
          </span>
          <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>
            🎉
          </span>
        </div>
      )}
    </div>
  );
};

export default SavingsProgressBar;
