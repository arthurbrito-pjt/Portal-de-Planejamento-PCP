import { Product, Coil, SlitterCombination } from '../types/pcp';
import { SlitterOptimizer } from './slitterOptimizer';

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

export interface SlitterProductionProgram {
  id: string;
  coil: Coil;
  mainProduct: Product;
  combination: SlitterCombination;
  materialsProduced: {
    product: Product;
    fitaLargura: number;
    quantidadeFitas: number;
    larguraTotal: number;
    pesoAlocadoTon: number;
    metrosEstimados: number;
    finalidade: 'PRINCIPAL' | 'COMPLEMENTAR';
  }[];
  totalFitas: number;
  larguraUtilMm: number;
  sobraMm: number;
  aproveitamentoPercent: number;
  sobraPesoTon: number;
  status: 'Pronto para Corte' | 'Em Ajuste' | 'Atende Demanda';
}

export class ReadinessService {
  /**
   * Generates the complete Ready Slitter Programs (Bobina -> Slitter -> Materiais Produzidos)
   * This is what the PCP Planner actually needs to see on the production floor!
   */
  static generateSlitterPrograms(products: Product[], coils: Coil[]): SlitterProductionProgram[] {
    const availableCoils = coils.filter(c => c.status === 'Disponível');
    const productsWithDemand = [...products].sort((a, b) => (b.demandaT || 0) - (a.demandaT || 0));

    const programs: SlitterProductionProgram[] = [];
    const usedCoilIds = new Set<string>();

    // For each high-demand product, find matching coils and optimize
    for (const prod of productsWithDemand) {
      const matchingCoils = availableCoils.filter(
        c => !usedCoilIds.has(c.id) && Math.abs(c.espessura - prod.espessura) < 0.001
      );

      if (matchingCoils.length === 0) continue;

      // Pick the best coil that minimizes scrap for this product
      let bestCoil: Coil | null = null;
      let bestCombination: SlitterCombination | null = null;

      for (const coil of matchingCoils.slice(0, 5)) {
        const combList = SlitterOptimizer.optimize({
          mainProduct: prod,
          desiredQuantityTon: prod.demandaT || 10,
          selectedCoil: coil,
          compatibleProducts: products,
          maxScrapAllowedMm: 10
        });

        if (combList.length > 0) {
          const topComb = combList[0];
          if (!bestCombination || topComb.sobraMm < bestCombination.sobraMm) {
            bestCoil = coil;
            bestCombination = topComb;
            if (topComb.sobraMm <= 10) break; // Found an optimal match!
          }
        }
      }

      if (bestCoil && bestCombination) {
        usedCoilIds.add(bestCoil.id);

        const materialsProduced = bestCombination.fitas.map(f => {
          const isMain = f.product.id === prod.id;
          const pesoTon = Number((bestCoil!.peso * (f.larguraTotal / bestCoil!.largura)).toFixed(3));
          const kgPerMeter = f.product.pesoPorMetro || (f.product.larguraFita * f.product.espessura * 7.85 / 1000);
          const metros = kgPerMeter > 0 ? Math.round((pesoTon * 1000) / kgPerMeter) : 0;

          return {
            product: f.product,
            fitaLargura: f.product.larguraFita,
            quantidadeFitas: f.quantidade,
            larguraTotal: f.larguraTotal,
            pesoAlocadoTon: pesoTon,
            metrosEstimados: metros,
            finalidade: (isMain ? 'PRINCIPAL' : 'COMPLEMENTAR') as 'PRINCIPAL' | 'COMPLEMENTAR'
          };
        });

        const totalFitas = bestCombination.fitas.reduce((acc, f) => acc + f.quantidade, 0);

        programs.push({
          id: `PROG_${bestCoil.id}_${prod.id}`,
          coil: bestCoil,
          mainProduct: prod,
          combination: bestCombination,
          materialsProduced,
          totalFitas,
          larguraUtilMm: bestCombination.totalLarguraUsada,
          sobraMm: bestCombination.sobraMm,
          aproveitamentoPercent: bestCombination.aproveitamentoPercent,
          sobraPesoTon: bestCombination.pesoSobraTon,
          status: bestCombination.sobraMm <= 10 ? 'Pronto para Corte' : 'Atende Demanda'
        });
      }
    }

    // Sort programs: Smallest scrap (highest yield) first, then highest coil weight
    programs.sort((a, b) => {
      if (a.sobraMm !== b.sobraMm) return a.sobraMm - b.sobraMm;
      return b.coil.peso - a.coil.peso;
    });

    return programs;
  }

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

      let bestCoil: Coil | null = null;
      let estimatedStrips = 0;
      let estimatedScrapMm = 0;
      let estimatedYieldPercent = 0;

      if (matchingCoils.length > 0) {
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
