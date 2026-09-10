import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  actionIcon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon
}) => {
  return (
    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed font-medium">{description}</p>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-md shadow-blue-500/20 transition-all hover:scale-105"
      >
        {ActionIcon && <ActionIcon className="w-4 h-4" />}
        <span>{actionLabel}</span>
      </button>
    </div>
  );
};
