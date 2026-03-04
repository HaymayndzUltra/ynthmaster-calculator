import React from 'react';

interface StepDotsProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export const StepDots: React.FC<StepDotsProps> = ({
  totalSteps,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label="Step progress"
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCurrent = stepNum === currentStep;
        const isCompleted = completedSteps.has(stepNum);
        const isPast = stepNum < currentStep;

        let bg = 'transparent';
        let border = 'var(--border-subtle)';
        if (isCurrent) {
          bg = 'var(--accent-blue)';
          border = 'var(--accent-blue)';
        } else if (isCompleted || isPast) {
          bg = 'var(--accent-green)';
          border = 'var(--accent-green)';
        }

        return (
          <button
            key={stepNum}
            onClick={() => onStepClick(stepNum)}
            className="w-2.5 h-2.5 rounded-full border cursor-pointer transition-all duration-[250ms] hover:scale-125"
            style={{
              backgroundColor: bg,
              borderColor: border,
              transform: isCurrent ? 'scale(1.3)' : undefined,
              transitionTimingFunction: 'var(--ease-spring)',
            }}
            aria-label={`Step ${stepNum}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
            title={`Step ${stepNum}`}
          />
        );
      })}
    </div>
  );
};
