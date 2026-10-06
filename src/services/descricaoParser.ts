// Extrai espessura + dimensões de uma descrição de produto, ex:
// "PERFIL U ENRIJ LQ 2,00 X 100 X 40 X 17 MM" -> [2.00, 100, 40, 17]
// "TUBO IND LQ RD 1,50 X 48,30 NBR6591" -> [1.50, 48.30]
// O primeiro número é sempre a espessura; os demais são as dimensões do perfil/tubo.
export function extractDimsSegment(desc: string): number[] | null {
  const m = desc.match(/(\d+(?:,\d+)?(?:\s*[Xx]\s*\d+(?:,\d+)?)+)/);
  if (!m) return null;
  const tokens = m[1].split(/[Xx]/).map(t => parseFloat(t.trim().replace(',', '.')));
  return tokens.some(Number.isNaN) ? null : tokens;
}

// Formato do tubo (RD=redondo, QD=quadrado, RT=retangular), indicado na
// descrição logo antes da espessura, ex: "TUBO IND LQ RD 1,50 X 48,30 NBR6591".
export function extractTuboTipo(desc: string): 'RD' | 'QD' | 'RT' | null {
  const m = desc.match(/\b(RD|QD|RT)\b/i);
  return m ? (m[1].toUpperCase() as 'RD' | 'QD' | 'RT') : null;
}
