import { Product, SlitterStrip } from '../types/pcp';

export interface ExcessItem {
  productId: string;
  codigo: string;
  descricao: string;
  demandaT: number;
  producedT: number;
  excessT: number;
}

/**
 * Produção acima da demanda só pode seguir com autorização de quem confere o
 * plano. Aqui se apura, por item, quanto o plano produz além da demanda
 * pendente (itens fora da programação, sem demanda, contam inteiros como excedente).
 */
export class DemandExcessService {
  static tolerance(demandaT: number): number {
    return Math.max(0.05, demandaT * 0.01);
  }

  static computeFromStrips(strips: SlitterStrip[], products: Product[]): ExcessItem[] {
    const produced = new Map<string, number>();
    strips.forEach(s => produced.set(s.productId, (produced.get(s.productId) ?? 0) + s.pesoTon));

    const rows = Array.from(produced.entries()).map(([productId, producedT]) => {
      const prod = products.find(p => p.id === productId);
      const demandaT = prod?.demandaT || 0;
      return { productId, prod, demandaT, producedT };
    });

    // Sem nenhuma demanda informada não há referência para falar em excedente.
    if (rows.every(r => r.demandaT <= 0)) return [];

    return rows
      .map(r => ({
        productId: r.productId,
        codigo: r.prod?.codigo ?? r.productId,
        descricao: r.prod?.descricao ?? '',
        demandaT: Number(r.demandaT.toFixed(2)),
        producedT: Number(r.producedT.toFixed(2)),
        excessT: Number((r.producedT - r.demandaT).toFixed(2))
      }))
      .filter(r => r.excessT > this.tolerance(r.demandaT))
      .sort((a, b) => b.excessT - a.excessT);
  }

  /** Identifica o conjunto de excedentes — a autorização só vale para o plano que foi autorizado. */
  static signature(items: ExcessItem[]): string {
    return items.map(i => `${i.productId}:${i.excessT}`).sort().join('|');
  }
}
