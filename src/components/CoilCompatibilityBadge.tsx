import React from 'react';
import { RankedCoil } from '../services/coilCompatibilityService';
import { PackageCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CoilCompatibilityBadgeProps {
  ranked: RankedCoil;
}

export const CoilCompatibilityBadge: React.FC<CoilCompatibilityBadgeProps> = ({ ranked }) => {
  if (ranked.isWip) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
        <PackageCheck className="w-3 h-3" /> Estoque intermediário disponível
      </span>
    );
  }

  if (!ranked.isSobraNaFaixa) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium">
        <AlertTriangle className="w-3 h-3" /> Sobra fora da banda ({ranked.sobraMm}mm)
      </span>
    );
  }

  if (ranked.violaPoliticaVolume) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium">
        <AlertTriangle className="w-3 h-3" /> Fora da política de volume
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium">
      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Compatível ({ranked.sobraMm}mm de refilo)
    </span>
  );
};
