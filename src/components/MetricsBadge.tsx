import React from 'react';
import { getAproveitamentoLevel, getSobraLevel, getDificuldadeLevel, isPendenteAjusteContabil } from '../domain/metricsThresholds';

interface MetricsBadgeProps {
  type: 'aproveitamento' | 'sobra' | 'status' | 'familia' | 'dificuldade' | 'contabil' | 'ferramental_abc' | 'ferramental_cadastro';
  value: number | string;
  size?: 'sm' | 'md' | 'lg';
}

export const MetricsBadge: React.FC<MetricsBadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold'
  }[size];

  if (type === 'aproveitamento') {
    const val = typeof value === 'number' ? value : parseFloat(value);
    const level = getAproveitamentoLevel(val);
    const bg = level === 'critico'
      ? 'bg-red-50 text-red-800 border-red-300'
      : level === 'atencao'
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-emerald-50 text-emerald-800 border-emerald-300';

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {val.toFixed(1)}% Aproveitamento
      </span>
    );
  }

  if (type === 'sobra') {
    const val = typeof value === 'number' ? value : parseFloat(value);
    const level = getSobraLevel(val);
    const bg = level === 'ok'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : level === 'atencao'
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-red-50 text-red-800 border-red-300';
    const text = level === 'ok'
      ? `${val} mm (Ideal 10 a 18 mm)`
      : level === 'atencao'
      ? `${val} mm (Refilo < 10 mm)`
      : `${val} mm (Sobra > 18 mm)`;

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
          ? 'bg-[#0B1F3A]/10 text-[#0B1F3A] border-[#0B1F3A]/20' 
          : 'bg-purple-50 text-purple-800 border-purple-200'
      } ${sizeClasses}`}>
        {value}
      </span>
    );
  }

  if (type === 'dificuldade') {
    const grau = String(value).toUpperCase();
    const level = getDificuldadeLevel(grau);
    const bg = level === 'ok'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : level === 'atencao'
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-red-50 text-red-800 border-red-300';

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {grau}
      </span>
    );
  }

  if (type === 'contabil') {
    const isPendente = isPendenteAjusteContabil(String(value));
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${
        isPendente
          ? 'bg-amber-50 text-amber-800 border-amber-300'
          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
      } ${sizeClasses}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isPendente ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
        {isPendente ? 'Físico na Baia (Ajuste Pendente)' : 'Contábil Conciliado'}
      </span>
    );
  }

  if (type === 'ferramental_cadastro') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border bg-red-50 text-red-800 border-red-300 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Ferramental não cadastrado
      </span>
    );
  }

  if (type === 'ferramental_abc') {
    const classe = String(value).toUpperCase();
    let bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    let label = 'Classe A (Sempre Roda)';
    if (classe.includes('B')) {
      bg = 'bg-[#0B1F3A]/10 text-[#0B1F3A] border-[#0B1F3A]/25';
      label = 'Classe B (Regular)';
    } else if (classe.includes('C')) {
      bg = 'bg-orange-50 text-orange-800 border-orange-300';
      label = 'Classe C (Menos Roda)';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {label}
      </span>
    );
  }

  // Status
  const statusStr = String(value);
  let statusColor = 'bg-slate-100 text-slate-700 border-slate-300';
  if (statusStr === 'Disponível' || statusStr === 'Concluída' || statusStr.includes('Ideal')) {
    statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (statusStr === 'Em Produção' || statusStr === 'Em Corte' || statusStr === 'Planejada' || statusStr === 'Liberada') {
    statusColor = 'bg-orange-50 text-orange-900 border-orange-300';
  } else if (statusStr.includes('< 10') || statusStr.includes('> 18')) {
    statusColor = 'bg-amber-50 text-amber-800 border-amber-300';
  } else if (statusStr === 'Consumida') {
    statusColor = 'bg-slate-100 text-slate-500 border-slate-200';
  } else if (statusStr === 'Cancelada') {
    statusColor = 'bg-red-50 text-red-700 border-red-200';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${statusColor} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {statusStr}
    </span>
  );
};
