/**
 * Regras de negócio por trás dos badges de status (antes hardcoded inline em
 * MetricsBadge.tsx). Centralizado aqui para auditoria única das faixas — os
 * valores abaixo são cópia exata dos limites já usados no sistema, não uma
 * reinterpretação.
 */

// Faixa de refilo lateral aceita pelo PCP (mm).
export const REFILO_MIN_MM = 12;
export const REFILO_MAX_MM = 18;

export type ThresholdLevel = 'ok' | 'atencao' | 'critico';

export function getAproveitamentoLevel(percent: number): ThresholdLevel {
  if (percent < 95) return 'critico';
  if (percent < 98.5) return 'atencao';
  return 'ok';
}

export function getSobraLevel(sobraMm: number): ThresholdLevel {
  if (sobraMm < REFILO_MIN_MM) return 'atencao';
  if (sobraMm > REFILO_MAX_MM) return 'critico';
  return 'ok';
}

export function isSobraNaFaixaIdeal(sobraMm: number): boolean {
  return sobraMm >= REFILO_MIN_MM && sobraMm <= REFILO_MAX_MM;
}

export function getDificuldadeLevel(grau: string): ThresholdLevel {
  const g = grau.toUpperCase();
  if (g === 'BAIXO') return 'ok';
  if (g === 'MEDIO') return 'atencao';
  if (g === 'ALTO') return 'critico';
  return 'atencao';
}

export function isPendenteAjusteContabil(statusContabil: string): boolean {
  return statusContabil.toUpperCase().includes('PENDENTE');
}
