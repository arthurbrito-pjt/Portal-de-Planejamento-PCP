import React from 'react';
import { Check } from 'lucide-react';

export interface WizardStep {
  num: number;
  title: string;
}

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (num: number) => void;
  isStepEnabled?: (num: number) => boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  isStepEnabled
}) => {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((st) => {
          const isCompleted = currentStep > st.num;
          const isCurrent = currentStep === st.num;
          const enabled = isCompleted || isCurrent || (isStepEnabled ? isStepEnabled(st.num) : false);

          return (
            <button
              key={st.num}
              onClick={() => enabled && onStepClick && onStepClick(st.num)}
              disabled={!enabled}
              className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                isCurrent
                  ? 'bg-[#0B1F3A] text-white shadow-md ring-2 ring-orange-500/50'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-slate-50 text-slate-400 opacity-70 cursor-not-allowed border border-slate-100'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                isCompleted 
                  ? 'bg-emerald-600 text-white' 
                  : isCurrent 
                  ? 'bg-orange-500 text-white shadow-sm' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
              </div>
              <span className="truncate">Etapa {st.num}: {st.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
