import { Product, Coil, SlitterCombination, SlitterDemandItem, ProductFamily } from '../types/pcp';
import { SlitterOptimizer } from './slitterOptimizer';
import { SlitterCatalogService } from './slitterCatalogService';

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
    codigoSlitter: string;
    nomeSlitter: string;
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
  status: 'Conforme (10 a 18 mm)' | 'Sobra Excedente (> 18 mm)';
}

export class ReadinessService {
  /**
   * Aggregates demands by SLITTER (larguraFita x espessura), calculating the total
   * demand from both Tubos and Perfis.
   */
  static analyzeSlitters(products: Product[], coils: Coil[]): SlitterDemandItem[] {
    const availableCoils = coils.filter(c => c.status === 'Disponível');

    // Group products by unique Slitter dimensions (larguraFita + espessura)
    const slitterMap = new Map<string, {
      larguraFita: number;
      espessura: number;
      produtos: { product: Product; demandaT: number; familia: ProductFamily }[];
    }>();

    for (const p of products) {
      const key = `${p.larguraFita}_${p.espessura}`;
      if (!slitterMap.has(key)) {
        slitterMap.set(key, {
          larguraFita: p.larguraFita,
          espessura: p.espessura,
          produtos: []
        });
      }
      slitterMap.get(key)!.produtos.push({
        product: p,
        demandaT: p.demandaT || 0,
        familia: p.familia
      });
    }

    const slitterList: SlitterDemandItem[] = [];

    for (const [key, group] of slitterMap.entries()) {
      const { larguraFita, espessura, produtos } = group;
      
      const totalDemandaT = Number(produtos.reduce((acc, item) => acc + item.demandaT, 0).toFixed(2));
      const demandaTubosT = Number(produtos.filter(i => i.familia === 'TUBO').reduce((acc, i) => acc + i.demandaT, 0).toFixed(2));
      const demandaPerfisT = Number(produtos.filter(i => i.familia === 'PERFIL').reduce((acc, i) => acc + i.demandaT, 0).toFixed(2));
      const qtdTubos = produtos.filter(i => i.familia === 'TUBO').length;
      const qtdPerfis = produtos.filter(i => i.familia === 'PERFIL').length;

      // Find primary product with largest demand in this slitter group
      const sortedProds = [...produtos].sort((a, b) => b.demandaT - a.demandaT);
      const mainProduct = sortedProds[0]?.product || produtos[0].product;

      // Match available coils with same thickness
      const matchingCoils = availableCoils.filter(
        c => Math.abs(c.espessura - espessura) < 0.001
      );

      const compatibleLotCount = matchingCoils.length;
      const totalCompatibleWeightTon = Number(
        matchingCoils.reduce((acc, c) => acc + c.peso, 0).toFixed(2)
      );

      let coveragePercent = 0;
      if (totalDemandaT > 0) {
        coveragePercent = Math.min(999, Math.round((totalCompatibleWeightTon / totalDemandaT) * 100));
      } else if (compatibleLotCount > 0) {
        coveragePercent = 100;
      }

      let status: ReadinessStatus = 'BLOQUEADO';
      if (compatibleLotCount > 0) {
        if (totalDemandaT <= 0 || totalCompatibleWeightTon >= totalDemandaT) {
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
        let bestDistanceToIdeal = 9999;
        matchingCoils.forEach(c => {
          const strips = Math.floor(c.largura / larguraFita);
          if (strips > 0) {
            const scrap = c.largura - (strips * larguraFita);
            const inRange = scrap >= 10 && scrap <= 18;
            const dist = inRange ? Math.abs(scrap - 14) : Math.abs(scrap - 14) + 100;
            if (dist < bestDistanceToIdeal) {
              bestDistanceToIdeal = dist;
              bestCoil = c;
              estimatedStrips = strips;
              estimatedScrapMm = scrap;
              estimatedYieldPercent = Number((((c.largura - scrap) / c.largura) * 100).toFixed(1));
            }
          }
        });

        if (!bestCoil) {
          bestCoil = matchingCoils[0];
          estimatedStrips = Math.floor(bestCoil.largura / larguraFita);
          estimatedScrapMm = bestCoil.largura - (estimatedStrips * larguraFita);
          estimatedYieldPercent = Number((((bestCoil.largura - estimatedScrapMm) / bestCoil.largura) * 100).toFixed(1));
        }
      }

      const slitterInfo = SlitterCatalogService.getSlitterInfo(larguraFita, espessura, mainProduct);

      slitterList.push({
        id: `SLT_${larguraFita}_${espessura}`,
        codigoSlitter: slitterInfo.code,
        nomeSlitter: slitterInfo.name,
        larguraFita,
        espessura,
        totalDemandaT,
        demandaTubosT,
        demandaPerfisT,
        qtdTubos,
        qtdPerfis,
        produtos,
        mainProduct,
        status,
        compatibleLotCount,
        totalCompatibleWeightTon,
        coveragePercent,
        bestCoil,
        estimatedStrips,
        estimatedScrapMm,
        estimatedYieldPercent
      });
    }

    return slitterList;
  }

  static sortSlittersByReadiness(items: SlitterDemandItem[]): SlitterDemandItem[] {
    const statusWeight: Record<ReadinessStatus, number> = {
      'PRONTO': 3,
      'PARCIAL': 2,
      'BLOQUEADO': 1
    };

    return [...items].sort((a, b) => {
      const diffStatus = statusWeight[b.status] - statusWeight[a.status];
      if (diffStatus !== 0) return diffStatus;

      if (b.totalDemandaT !== a.totalDemandaT) return b.totalDemandaT - a.totalDemandaT;

      return b.totalCompatibleWeightTon - a.totalCompatibleWeightTon;
    });
  }

  /**
   * Generates the complete Ready Slitter Programs (Bobina -> Slitter -> Materiais Produzidos).
   * STRICT CRITERIA: Scrap MUST be between 10mm and 18mm (1.5% limit). Programs with < 10mm are discarded!
   */
  static generateSlitterPrograms(products: Product[], coils: Coil[]): SlitterProductionProgram[] {
    const availableCoils = coils.filter(c => c.status === 'Disponível');
    const slittersWithDemand = this.analyzeSlitters(products, coils)
      .sort((a, b) => b.totalDemandaT - a.totalDemandaT);

    const programs: SlitterProductionProgram[] = [];
    const usedCoilIds = new Set<string>();

    for (const slitterItem of slittersWithDemand) {
      const prod = slitterItem.mainProduct;
      const matchingCoils = availableCoils.filter(
        c => !usedCoilIds.has(c.id) && Math.abs(c.espessura - prod.espessura) < 0.001
      );

      if (matchingCoils.length === 0) continue;

      let bestCoil: Coil | null = null;
      let bestCombination: SlitterCombination | null = null;

      for (const coil of matchingCoils.slice(0, 8)) {
        const combList = SlitterOptimizer.optimize({
          mainProduct: prod,
          desiredQuantityTon: slitterItem.totalDemandaT || 10,
          selectedCoil: coil,
          compatibleProducts: products,
          minScrapMm: 10,
          maxScrapAllowedMm: 18
        });

        // Filter out any combination with scrap < 10mm
        const compliantCombs = combList.filter(c => c.sobraMm >= 10);
        if (compliantCombs.length > 0) {
          const topComb = compliantCombs[0];
          const isTopInIdeal = topComb.sobraMm >= 10 && topComb.sobraMm <= 18;

          if (!bestCombination) {
            bestCoil = coil;
            bestCombination = topComb;
          } else {
            const isCurrentInIdeal = bestCombination.sobraMm >= 10 && bestCombination.sobraMm <= 18;
            if (isTopInIdeal && !isCurrentInIdeal) {
              bestCoil = coil;
              bestCombination = topComb;
            } else if (isTopInIdeal && isCurrentInIdeal) {
              if (Math.abs(topComb.sobraMm - 14) < Math.abs(bestCombination.sobraMm - 14)) {
                bestCoil = coil;
                bestCombination = topComb;
              }
            } else if (!isTopInIdeal && !isCurrentInIdeal && topComb.sobraMm < bestCombination.sobraMm) {
              bestCoil = coil;
              bestCombination = topComb;
            }
          }

          if (isTopInIdeal) break;
        }
      }

      // STRICT VALIDATION: Only include if sobraMm >= 10
      if (bestCoil && bestCombination && bestCombination.sobraMm >= 10) {
        usedCoilIds.add(bestCoil.id);

        const materialsProduced = bestCombination.fitas.map(f => {
          const isMain = f.product.id === prod.id || (f.product.larguraFita === slitterItem.larguraFita && f.product.espessura === slitterItem.espessura);
          const pesoTon = Number((bestCoil!.peso * (f.larguraTotal / bestCoil!.largura)).toFixed(3));
          const kgPerMeter = f.product.pesoPorMetro || (f.product.larguraFita * f.product.espessura * 7.85 / 1000);
          const metros = kgPerMeter > 0 ? Math.round((pesoTon * 1000) / kgPerMeter) : 0;
          const sInfo = SlitterCatalogService.getSlitterInfo(f.product.larguraFita, f.product.espessura, f.product);

          return {
            product: f.product,
            codigoSlitter: sInfo.code,
            nomeSlitter: sInfo.name,
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
          status: bestCombination.sobraMm <= 18 ? 'Conforme (10 a 18 mm)' : 'Sobra Excedente (> 18 mm)'
        });
      }
    }

    // Sort programs: strictly 10 to 18mm first, then by closest to 14mm
    programs.sort((a, b) => {
      const aIdeal = a.sobraMm >= 10 && a.sobraMm <= 18 ? 1 : 0;
      const bIdeal = b.sobraMm >= 10 && b.sobraMm <= 18 ? 1 : 0;
      if (aIdeal !== bIdeal) return bIdeal - aIdeal;

      return Math.abs(a.sobraMm - 14) - Math.abs(b.sobraMm - 14);
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
        let bestDistanceToIdeal = 9999;
        matchingCoils.forEach(c => {
          const strips = Math.floor(c.largura / product.larguraFita);
          if (strips > 0) {
            const scrap = c.largura - (strips * product.larguraFita);
            const inRange = scrap >= 10 && scrap <= 18;
            const dist = inRange ? Math.abs(scrap - 14) : Math.abs(scrap - 14) + 100;
            if (dist < bestDistanceToIdeal) {
              bestDistanceToIdeal = dist;
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

