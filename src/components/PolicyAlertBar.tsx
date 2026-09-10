import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface PolicyAlert {
  id: string;
  message: string;
  tone?: 'amber' | 'violet' | 'red';
}

interface PolicyAlertBarProps {
  alerts: PolicyAlert[];
}

const TONE_CLASSES: Record<NonNullable<PolicyAlert['tone']>, string> = {
  amber: 'bg-amber-50 text-amber-800',
  violet: 'bg-violet-50 text-violet-800',
  red: 'bg-red-50 text-red-800'
};

const ICON_CLASSES: Record<NonNullable<PolicyAlert['tone']>, string> = {
  amber: 'text-amber-600',
  violet: 'text-violet-600',
  red: 'text-red-600'
};

/**
 * Banners de política (volume, ABC ferramental, fragmentação de lote) mostrados
 * SEMPRE no topo, antes de qualquer ação — preventivo, não reativo.
 */
export const PolicyAlertBar: React.FC<PolicyAlertBarProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map(a => {
        const tone = a.tone || 'amber';
        return (
          <div key={a.id} className={`p-3 rounded-lg text-xs flex items-center gap-2 ${TONE_CLASSES[tone]}`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 ${ICON_CLASSES[tone]}`} />
            <span>{a.message}</span>
          </div>
        );
      })}
    </div>
  );
};
