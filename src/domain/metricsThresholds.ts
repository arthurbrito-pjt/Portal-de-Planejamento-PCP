/**
 * Regras de negócio por trás dos badges de status (antes hardcoded inline em
 * MetricsBadge.tsx). Centralizado aqui para auditoria única das faixas — os
 * valores abaixo são cópia exata dos limites já usados no sistema, não uma
 * reinterpretação.
 */

export type ThresholdLevel = 'ok' | 'atencao' | 'critico';

export function getAproveitamentoLevel(percent: number): ThresholdLevel {
  if (percent < 95) return 'critico';
  if (percent < 98.5) return 'atencao';
  return 'ok';
}

export function getSobraLevel(sobraMm: number): ThresholdLevel {
  if (sobraMm < 10) return 'atencao';
  if (sobraMm > 18) return 'critico';
  return 'ok';
}

export function isSobraNaFaixaIdeal(sobraMm: number): boolean {
  return sobraMm >= 10 && sobraMm <= 18;
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
