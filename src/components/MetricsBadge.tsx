import React from 'react';

interface MetricsBadgeProps {
  type: 'aproveitamento' | 'sobra' | 'status' | 'familia';
  value: number | string;
  size?: 'sm' | 'md' | 'lg';
}

export const MetricsBadge: React.FC<MetricsBadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-bold'
  }[size];

  if (type === 'aproveitamento') {
    const val = typeof value === 'number' ? value : parseFloat(value);
    let bg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (val < 95) bg = 'bg-red-500/15 text-red-400 border-red-500/30';
    else if (val < 99) bg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border ${bg} ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {val.toFixed(1)}% Aproveitamento
      </span>
    );
  }

  if (type === 'sobra') {
    const val = typeof value === 'number' ? value : parseFloat(value);
    let bg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    let text = `${val} mm (Ideal ≤ 10mm)`;
    
    if (val === 0) {
      text = '0 mm (Sobra Zero)';
    } else if (val > 18) {
      bg = 'bg-red-500/15 text-red-400 border-red-500/30';
      text = `${val} mm (Crítico > 10mm)`;
    } else if (val > 10) {
      bg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      text = `${val} mm (Refilo Padrão)`;
    }

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border ${bg} ${sizeClasses}`}>
        {text}
      </span>
    );
  }

  if (type === 'familia') {
    const isTubo = String(value).toUpperCase().includes('TUBO');
    return (
      <span className={`inline-flex items-center rounded-md border ${
        isTubo 
          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
          : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
      } ${sizeClasses}`}>
        {value}
      </span>
    );
  }

  // Status
  const statusStr = String(value);
  let statusColor = 'bg-slate-700/50 text-slate-300 border-slate-600';
  if (statusStr === 'Disponível' || statusStr === 'Concluída' || statusStr === 'Liberada') {
    statusColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (statusStr === 'Em Produção' || statusStr === 'Em Corte' || statusStr === 'Planejada') {
    statusColor = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  } else if (statusStr === 'Consumida' || statusStr === 'Cancelada') {
    statusColor = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${statusColor} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {statusStr}
    </span>
  );
};
