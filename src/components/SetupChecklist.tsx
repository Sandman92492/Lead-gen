import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { ONBOARDING_STEPS } from '../types/onboarding';
import { ChevronDownIcon, ChevronUpIcon } from './ui/Icons';

interface SetupChecklistProps {
  onCreateCampaign?: () => void;
  className?: string;
}

const SetupChecklist: React.FC<SetupChecklistProps> = ({ onCreateCampaign, className = '' }) => {
  const navigate = useNavigate();
  const { progress, completedSteps, totalSteps, isComplete, progressPercent } = useOnboardingProgress();
  const [isExpanded, setIsExpanded] = useState(true);

  if (isComplete) return null;

  const handleStepClick = (stepId: string) => {
    switch (stepId) {
      case 'businessSetupComplete':
        navigate('/settings/business');
        break;
      case 'offerSetupComplete':
        navigate('/settings/offer');
        break;
      case 'whatsappTemplateComplete':
        navigate('/settings/whatsapp-template');
        break;
      case 'firstCampaignCreated':
        onCreateCampaign?.();
        break;
      case 'firstShareComplete':
        navigate('/campaigns');
        break;
      case 'firstLeadHandled':
        navigate('/leads');
        break;
    }
  };

  return (
    <div className={`bg-bg-card border-2 border-slate-900 rounded-[var(--r-lg)] overflow-hidden shadow-xl ${className}`}>
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 hover:bg-surface transition-colors focus:outline-none"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">Get started</h3>
            <div className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-text-primary">
              {completedSteps}/{totalSteps}
            </div>
          </div>
          <div className="text-text-secondary">
            {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          </div>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-action-primary"
          />
        </div>
      </button>

      {/* Steps List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border-subtle border-t border-border-subtle">
              {ONBOARDING_STEPS.map((step, idx) => {
                const isCompleted = progress[step.id];
                const isClickable = !isCompleted;

                return (
                  <motion.button
                    key={step.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    type="button"
                    onClick={() => isClickable && handleStepClick(step.id)}
                    disabled={isCompleted}
                    className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${isClickable ? 'hover:bg-surface cursor-pointer' : 'cursor-default opacity-80'
                      }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCompleted
                        ? 'bg-action-primary text-white scale-110 shadow-lg shadow-action-primary/20'
                        : 'border-2 border-border-subtle'
                        }`}
                    >
                      {isCompleted ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold ${isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'
                          }`}
                      >
                        {step.label}
                      </p>
                      {!isCompleted && (
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{step.description}</p>
                      )}
                    </div>

                    {/* Action Hint */}
                    {isClickable && (
                      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-secondary group-hover:bg-action-primary group-hover:text-white transition-all">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SetupChecklist;
