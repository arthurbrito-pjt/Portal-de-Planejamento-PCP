// Limites de refilo (mm): cada lado 4–9 e total 8–18.
export const REFILO_LADO_MIN_MM = 4;
export const REFILO_LADO_MAX_MM = 9;
export const REFILO_TOTAL_MIN_MM = 8;
export const REFILO_TOTAL_MAX_MM = 18;

export interface RefiloLados {
  esquerdoMm: number;
  direitoMm: number;
  totalMm: number;
  valido: boolean;
  motivo?: string;
}

export class RefiloService {
  /**
   * Divide a sobra da bobina entre os dois lados (centralizando o corte) e
   * confere os limites de cada lado e do total. Com total entre 8 e 18 mm a
   * divisão central sempre respeita 4–9 mm por lado; fora disso o plano é inválido.
   */
  static calcular(sobraMm: number): RefiloLados {
    const totalMm = Number(sobraMm.toFixed(2));
    const esquerdoMm = Number((totalMm / 2).toFixed(2));
    const direitoMm = Number((totalMm - esquerdoMm).toFixed(2));

    let motivo: string | undefined;
    if (totalMm < REFILO_TOTAL_MIN_MM) motivo = `refilo total ${totalMm} mm abaixo do mínimo (${REFILO_TOTAL_MIN_MM} mm)`;
    else if (totalMm > REFILO_TOTAL_MAX_MM) motivo = `refilo total ${totalMm} mm acima do máximo (${REFILO_TOTAL_MAX_MM} mm)`;
    else if (esquerdoMm < REFILO_LADO_MIN_MM || direitoMm < REFILO_LADO_MIN_MM) motivo = `refilo de lado abaixo de ${REFILO_LADO_MIN_MM} mm`;
    else if (esquerdoMm > REFILO_LADO_MAX_MM || direitoMm > REFILO_LADO_MAX_MM) motivo = `refilo de lado acima de ${REFILO_LADO_MAX_MM} mm`;

    return { esquerdoMm, direitoMm, totalMm, valido: !motivo, motivo };
  }

  static isValido(sobraMm: number): boolean {
    return this.calcular(sobraMm).valido;
  }
}
