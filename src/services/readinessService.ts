import { Product, Coil } from '../types/pcp';

export type ReadinessStatus = 'PRONTO' | 'PARCIAL' | 'BLOQUEADO';

export interface ProductReadiness {
  product: Product;
  status: ReadinessStatus;
  compatibleLotCount: number;
  totalCompatibleWeightTon: number;
  coveragePercent: number;
  bestCoil: Coil | null;
  estimatedStrips: number;
  estimatedScrapMm: number;
  estimatedYieldPercent: number;
}

export class ReadinessService {
  /**
   * Computes readiness analysis for all products against current available coils
   */
  static analyze(products: Product[], coils: Coil[]): ProductReadiness[] {
    const availableCoils = coils.filter(c => c.status === 'Disponível');

    return products.map(product => {
      const matchingCoils = availableCoils.filter(
        c => Math.abs(c.espessura - product.espessura) < 0.001
      );

      const compatibleLotCount = matchingCoils.length;
      const totalCompatibleWeightTon = Number(
        matchingCoils.reduce((acc, c) => acc + c.peso, 0).toFixed(2)
      );

      const demanda = product.demandaT || 0;
      let coveragePercent = 0;
      if (demanda > 0) {
        coveragePercent = Math.min(999, Math.round((totalCompatibleWeightTon / demanda) * 100));
      } else if (compatibleLotCount > 0) {
        coveragePercent = 100;
      }

      let status: ReadinessStatus = 'BLOQUEADO';
      if (compatibleLotCount > 0) {
        if (demanda <= 0 || totalCompatibleWeightTon >= demanda) {
          status = 'PRONTO';
        } else {
          status = 'PARCIAL';
        }
      }

      // Find the best coil lot (prioritize smallest scrap <= 10mm)
      let bestCoil: Coil | null = null;
      let estimatedStrips = 0;
      let estimatedScrapMm = 0;
      let estimatedYieldPercent = 0;

      if (matchingCoils.length > 0) {
        // Evaluate each matching coil to find the best fit
        let minScrap = 9999;
        matchingCoils.forEach(c => {
          const strips = Math.floor(c.largura / product.larguraFita);
          if (strips > 0) {
            const scrap = c.largura - (strips * product.larguraFita);
            if (scrap < minScrap) {
              minScrap = scrap;
              bestCoil = c;
              estimatedStrips = strips;
              estimatedScrapMm = scrap;
              estimatedYieldPercent = Number((((c.largura - scrap) / c.largura) * 100).toFixed(1));
            }
          }
        });

        if (!bestCoil) {
          bestCoil = matchingCoils[0];
          estimatedStrips = Math.floor(bestCoil.largura / product.larguraFita);
          estimatedScrapMm = bestCoil.largura - (estimatedStrips * product.larguraFita);
          estimatedYieldPercent = Number((((bestCoil.largura - estimatedScrapMm) / bestCoil.largura) * 100).toFixed(1));
        }
      }

      return {
        product,
        status,
        compatibleLotCount,
        totalCompatibleWeightTon,
        coveragePercent,
        bestCoil,
        estimatedStrips,
        estimatedScrapMm,
        estimatedYieldPercent
      };
    });
  }

  /**
   * Sort products prioritizing those that CAN be produced immediately:
   * 1. Status: PRONTO first, then PARCIAL, then BLOQUEADO
   * 2. Highest demand
   * 3. Highest stock availability
   */
  static sortByReadiness(items: ProductReadiness[]): ProductReadiness[] {
    const statusWeight: Record<ReadinessStatus, number> = {
      'PRONTO': 3,
      'PARCIAL': 2,
      'BLOQUEADO': 1
    };

    return [...items].sort((a, b) => {
      const diffStatus = statusWeight[b.status] - statusWeight[a.status];
      if (diffStatus !== 0) return diffStatus;

      const demandA = a.product.demandaT || 0;
      const demandB = b.product.demandaT || 0;
      if (demandB !== demandA) return demandB - demandA;

      return b.totalCompatibleWeightTon - a.totalCompatibleWeightTon;
    });
  }
}
