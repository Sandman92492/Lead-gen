import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { ONBOARDING_STEPS } from '../types/onboarding';

interface SetupChecklistProps {
  onCreateCampaign?: () => void;
  className?: string;
}

const SetupChecklist: React.FC<SetupChecklistProps> = ({ onCreateCampaign, className = '' }) => {
  const navigate = useNavigate();
  const { progress, completedSteps, totalSteps, isComplete, progressPercent } = useOnboardingProgress();

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
        navigate('/settings/whatsapp');
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
    <div className={`bg-bg-card border border-border-subtle rounded-[var(--r-lg)] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text-primary">Get started</h3>
          <span className="text-xs font-medium text-text-secondary">
            {completedSteps}/{totalSteps} complete
          </span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-border-subtle">
        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = progress[step.id];
          const isClickable = !isCompleted;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && handleStepClick(step.id)}
              disabled={isCompleted}
              className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                isClickable ? 'hover:bg-surface cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-success text-white'
                    : 'border-2 border-border-subtle'
                }`}
              >
                {isCompleted && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isCompleted ? 'text-text-secondary line-through' : 'text-text-primary'
                  }`}
                >
                  {step.label}
                </p>
                {!isCompleted && (
                  <p className="text-xs text-text-secondary mt-0.5">{step.description}</p>
                )}
              </div>

              {/* Arrow */}
              {isClickable && (
                <svg
                  className="w-4 h-4 text-text-secondary flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SetupChecklist;
