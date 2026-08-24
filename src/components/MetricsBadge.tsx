import React from 'react';

interface MetricsBadgeProps {
  type: 'aproveitamento' | 'sobra' | 'status' | 'familia';
  value: number | string;
  size?: 'sm' | 'md' | 'lg';
}

export const MetricsBadge: React.FC<MetricsBadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-3.5 py-1.5 text-sm font-black'
  }[size];

  if (type === 'aproveitamento') {
    const val = typeof value === 'number' ? value : parseFloat(value);
    let bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (val < 95) bg = 'bg-red-50 text-red-800 border-red-300';
    else if (val < 99) bg = 'bg-amber-50 text-amber-800 border-amber-300';

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {val.toFixed(1)}% Aproveitamento
      </span>
    );
  }

  if (type === 'sobra') {
    const val = typeof value === 'number' ? value : parseFloat(value);
    let bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    let text = `${val} mm (Ideal ≤ 10mm)`;
    
    if (val === 0) {
      text = '0 mm (Sobra Zero)';
    } else if (val > 18) {
      bg = 'bg-red-50 text-red-800 border-red-300';
      text = `${val} mm (Crítico > 10mm)`;
    } else if (val > 10) {
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      text = `${val} mm (Refilo)`;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses}`}>
        {text}
      </span>
    );
  }

  if (type === 'familia') {
    const isTubo = String(value).toUpperCase().includes('TUBO');
    return (
      <span className={`inline-flex items-center rounded-lg border font-bold ${
        isTubo 
          ? 'bg-blue-50 text-blue-800 border-blue-200' 
          : 'bg-purple-50 text-purple-800 border-purple-200'
      } ${sizeClasses}`}>
        {value}
      </span>
    );
  }

  // Status
  const statusStr = String(value);
  let statusColor = 'bg-slate-100 text-slate-700 border-slate-300';
  if (statusStr === 'Disponível' || statusStr === 'Concluída' || statusStr === 'Liberada') {
    statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (statusStr === 'Em Produção' || statusStr === 'Em Corte' || statusStr === 'Planejada') {
    statusColor = 'bg-blue-50 text-blue-800 border-blue-300';
  } else if (statusStr === 'Consumida' || statusStr === 'Cancelada') {
    statusColor = 'bg-slate-100 text-slate-500 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${statusColor} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {statusStr}
    </span>
  );
};
