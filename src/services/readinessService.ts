import {
  Product,
  Coil,
  SlitterCombination,
  SlitterDemandItem,
  ProductFamily,
  DayProductionMetrics,
  SlitterOrder,
  Ferramental,
  SlitterIntermediaryItem
} from '../types/pcp';
import { SlitterOptimizer } from './slitterOptimizer';
import { SlitterCatalogService } from './slitterCatalogService';
import { OpPlannerService } from './opPlannerService';

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
  static analyzeSlitters(products: Product[], coils: Coil[], intermediarySlitters: SlitterIntermediaryItem[] = []): SlitterDemandItem[] {
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

      // Motor único de montagem da "melhor OP": desconta estoque de slitter
      // intermediário já cortado da demanda antes de decidir quais bobinas
      // matriz (e qual plano de corte) realmente precisam ser usados.
      const plan = OpPlannerService.plan({
        mainProduct,
        larguraFita,
        espessura,
        totalDemandaT,
        compatibleProducts: produtos.map(p => p.product),
        availableCoils,
        intermediarySlitters
      });

      const coveragePercent = plan.coveragePercent;

      let status: ReadinessStatus = 'BLOQUEADO';
      if (totalDemandaT <= 0) {
        status = (compatibleLotCount > 0 || plan.wipAvailableTon > 0) ? 'PRONTO' : 'BLOQUEADO';
      } else if (plan.isFullyCovered) {
        status = 'PRONTO';
      } else if (plan.coverageTon > 0) {
        status = 'PARCIAL';
      }

      const bestCoil = plan.coils[0] || null;
      const bestCombination = plan.combination;
      const estimatedStrips = bestCombination ? bestCombination.fitas.reduce((acc, f) => acc + f.quantidade, 0) : 0;
      const estimatedScrapMm = bestCombination ? bestCombination.sobraMm : 0;
      const estimatedYieldPercent = bestCombination ? bestCombination.aproveitamentoPercent : 0;

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
        recommendedCoils: plan.coils,
        recommendedCombinations: plan.combinations,
        estimatedStrips,
        estimatedScrapMm,
        estimatedYieldPercent,
        bestCombination,
        wipAvailableTon: plan.wipAvailableTon,
        effectiveDemandTon: plan.effectiveDemandTon,
        coveredByWipOnly: plan.coveredByWipOnly
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
  static generateSlitterPrograms(
    products: Product[],
    coils: Coil[],
    intermediarySlitters: SlitterIntermediaryItem[] = []
  ): SlitterProductionProgram[] {
    const availableCoils = coils.filter(c => c.status === 'Disponível');
    const slittersWithDemand = this.analyzeSlitters(products, coils, intermediarySlitters)
      .sort((a, b) => b.totalDemandaT - a.totalDemandaT);

    const programs: SlitterProductionProgram[] = [];
    const usedCoilIds = new Set<string>();

    for (const slitterItem of slittersWithDemand) {
      const prod = slitterItem.mainProduct;

      // Estoque de slitter intermediário já cortado é priorizado — se ele já
      // cobre toda a demanda, não há necessidade de cortar uma bobina nova.
      if (slitterItem.coveredByWipOnly) continue;
      const effectiveDemandTon = slitterItem.effectiveDemandTon ?? slitterItem.totalDemandaT;

      const matchingCoils = availableCoils.filter(
        c => !usedCoilIds.has(c.id) && Math.abs(c.espessura - prod.espessura) < 0.001
      );

      if (matchingCoils.length === 0) continue;

      let bestCoil: Coil | null = null;
      let bestCombination: SlitterCombination | null = null;

      for (const coil of matchingCoils.slice(0, 8)) {
        const combList = SlitterOptimizer.optimize({
          mainProduct: prod,
          desiredQuantityTon: effectiveDemandTon || 10,
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
              if (topComb.aproveitamentoPercent > bestCombination.aproveitamentoPercent) {
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

    // Sort programs: strictly 10 to 18mm first, then by highest aproveitamento percent
    programs.sort((a, b) => {
      const aIdeal = a.sobraMm >= 10 && a.sobraMm <= 18 ? 1 : 0;
      const bIdeal = b.sobraMm >= 10 && b.sobraMm <= 18 ? 1 : 0;
      if (aIdeal !== bIdeal) return bIdeal - aIdeal;

      return b.aproveitamentoPercent - a.aproveitamentoPercent;
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
        let bestYield = -1;
        matchingCoils.forEach(c => {
          const combList = SlitterOptimizer.optimize({
            mainProduct: product,
            desiredQuantityTon: demanda || 10,
            selectedCoil: c,
            compatibleProducts: products,
            minScrapMm: 10,
            maxScrapAllowedMm: 18
          });

          const topComb = combList[0];
          if (topComb && topComb.aproveitamentoPercent > bestYield) {
            bestYield = topComb.aproveitamentoPercent;
            bestCoil = c;
            estimatedStrips = topComb.fitas.reduce((acc, f) => acc + f.quantidade, 0);
            estimatedScrapMm = topComb.sobraMm;
            estimatedYieldPercent = topComb.aproveitamentoPercent;
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

  /**
   * Horizonte de Planejamento de 3 Dias (Hoje D+0, Amanhã D+1, D+2)
   * Indicadores: Volume, Sucata, Folga de Planejamento e Relação Toneladas/Setup ("Pouca MP = Mais Setups")
   */
  static generate3DaySchedule(
    programs: SlitterProductionProgram[],
    orders: SlitterOrder[],
    dailyNominalCapacityTon = 120
  ): {
    days: DayProductionMetrics[];
    programsByDay: { [diaIndice: number]: SlitterProductionProgram[] };
    backlog: { programs: SlitterProductionProgram[]; volumeTon: number };
  } {
    const now = new Date();
    const dayLabels = ['Hoje (D+0)', 'Amanhã (D+1)', 'D+2'];

    const programsByDay: { [diaIndice: number]: SlitterProductionProgram[] } = {
      0: [],
      1: [],
      2: []
    };
    const backlogPrograms: SlitterProductionProgram[] = [];

    let currentDay = 0;
    let currentDayAccumTon = 0;

    // Agrupa programas por espessura para minimizar trocas de facas/setups
    const sortedPrograms = [...programs].sort((a, b) => {
      if (Math.abs(a.coil.espessura - b.coil.espessura) > 0.001) {
        return a.coil.espessura - b.coil.espessura; // Agrupa mesma espessura
      }
      return b.coil.peso - a.coil.peso;
    });

    // Cada um dos 3 dias respeita a capacidade nominal; o que não couber
    // no horizonte vira backlog explícito em vez de inflar D+2 artificialmente.
    for (const prog of sortedPrograms) {
      while (
        currentDay < 2 &&
        currentDayAccumTon > 0 &&
        currentDayAccumTon + prog.coil.peso > dailyNominalCapacityTon
      ) {
        currentDay++;
        currentDayAccumTon = 0;
      }

      if (currentDay === 2 && currentDayAccumTon > 0 && currentDayAccumTon + prog.coil.peso > dailyNominalCapacityTon) {
        backlogPrograms.push(prog);
        continue;
      }

      programsByDay[currentDay].push(prog);
      currentDayAccumTon += prog.coil.peso;
    }

    const days: DayProductionMetrics[] = [0, 1, 2].map(dayIdx => {
      const progs = programsByDay[dayIdx] || [];
      const volumeProgramadoTon = Number(progs.reduce((acc, p) => acc + p.coil.peso, 0).toFixed(2));
      
      const folgaPlanejamentoPercent = Number(
        Math.max(0, ((dailyNominalCapacityTon - volumeProgramadoTon) / dailyNominalCapacityTon) * 100).toFixed(1)
      );

      const totalScrapMm = progs.reduce((acc, p) => acc + p.sobraMm, 0);
      const totalWidthMm = progs.reduce((acc, p) => acc + p.coil.largura, 0);
      const sucataMediaPercent = totalWidthMm > 0 
        ? Number(((totalScrapMm / totalWidthMm) * 100).toFixed(2)) 
        : 1.25;

      // Conta trocas de espessura (setups de facas do slitter)
      const uniqueThicknesses = new Set(progs.map(p => p.coil.espessura));
      const quantidadeSetups = Math.max(1, uniqueThicknesses.size);
      const toneladasPorSetup = Number((volumeProgramadoTon / quantidadeSetups).toFixed(1));

      let alertaSetup: string | undefined;
      if (toneladasPorSetup < 20 && volumeProgramadoTon > 0) {
        alertaSetup = 'Atenção: Alta fragmentação de espessuras. Pouca tonelagem por setup aumenta o tempo improdutivo de facas.';
      }

      const d = new Date(now);
      d.setDate(d.getDate() + dayIdx);
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');

      return {
        diaIndice: dayIdx,
        dataIso: d.toISOString().split('T')[0],
        dataRotulo: `${dayLabels[dayIdx]} — ${dayStr}/${monthStr}`,
        volumeProgramadoTon,
        capacidadeNominalTon: dailyNominalCapacityTon,
        folgaPlanejamentoPercent,
        sucataMediaPercent,
        quantidadeSetups,
        toneladasPorSetup,
        alertaSetup,
        ordensProgramadas: []
      };
    });

    const backlogVolumeTon = Number(
      backlogPrograms.reduce((acc, p) => acc + p.coil.peso, 0).toFixed(2)
    );

    return { days, programsByDay, backlog: { programs: backlogPrograms, volumeTon: backlogVolumeTon } };
  }

  /**
   * Análise da Matriz ABC de Ferramentais
   */
  static analyzeToolingABC(
    ferramentais: Ferramental[],
    products: Product[]
  ): {
    ferramental: Ferramental;
    demandaAcumuladaT: number;
    percentualAcumulado: number;
    statusAcumulo: string;
    prontaParaSetup: boolean;
  }[] {
    return ferramentais.map(f => {
      const matchingProds = products.filter(p => {
        const slt = SlitterCatalogService.getSlitterInfo(p.larguraFita, p.espessura, p);
        return slt.code === f.codigo || f.nome.includes(slt.code);
      });

      const demandaAcumuladaT = Number(
        matchingProds.reduce((acc, p) => acc + (p.demandaT || 0), 0).toFixed(2)
      );

      const percentualAcumulado = f.capacidadeMinimaT > 0
        ? Math.min(100, Math.round((demandaAcumuladaT / f.capacidadeMinimaT) * 100))
        : 100;

      let statusAcumulo = '';
      let prontaParaSetup = false;

      if (f.classe === 'A') {
        statusAcumulo = 'Liberado Contínuo (Sempre Roda)';
        prontaParaSetup = true;
      } else if (f.classe === 'B') {
        if (demandaAcumuladaT >= f.capacidadeMinimaT * 0.7) {
          statusAcumulo = 'Liberado para Campanha Regular';
          prontaParaSetup = true;
        } else {
          statusAcumulo = `Em Acúmulo (${demandaAcumuladaT}t / ${f.capacidadeMinimaT}t)`;
          prontaParaSetup = false;
        }
      } else {
        // Classe C
        if (demandaAcumuladaT >= f.capacidadeMinimaT) {
          statusAcumulo = 'Lote Mínimo Atingido (Setup Autorizado)';
          prontaParaSetup = true;
        } else {
          statusAcumulo = `Aguardando Lote Mínimo (${demandaAcumuladaT}t / ${f.capacidadeMinimaT}t)`;
          prontaParaSetup = false;
        }
      }

      return {
        ferramental: f,
        demandaAcumuladaT,
        percentualAcumulado,
        statusAcumulo,
        prontaParaSetup
      };
    }).sort((a, b) => {
      const classWeight: Record<string, number> = { 'A': 3, 'B': 2, 'C': 1 };
      const diff = (classWeight[b.ferramental.classe] || 0) - (classWeight[a.ferramental.classe] || 0);
      if (diff !== 0) return diff;
      return b.demandaAcumuladaT - a.demandaAcumuladaT;
    });
  }
}

