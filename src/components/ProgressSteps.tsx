import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step < currentStep
                ? 'bg-green-500 border-green-500 text-white'
                : step === currentStep
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'bg-white border-gray-300 text-gray-500'
            }`}
          >
            {step < currentStep ? (
              <Check className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{step}</span>
            )}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-16 h-0.5 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};