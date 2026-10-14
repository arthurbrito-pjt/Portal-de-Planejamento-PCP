import { Product, Coil, SlitterCombination, SlitterIntermediaryItem } from '../types/pcp';
import { SlitterOptimizer } from './slitterOptimizer';

export interface OpPlan {
  totalDemandaT: number;
  wipAvailableTon: number;
  effectiveDemandTon: number; // o que ainda precisa ser cortado de bobina matriz, após descontar o estoque de slitter
  coveredByWipOnly: boolean; // demanda 100% atendida só com estoque intermediário, sem cortar bobina nova
  coils: Coil[]; // bobina(s) matriz recomendada(s) para atingir a demanda efetiva
  totalCoilsWeightTon: number;
  combinations: (SlitterCombination | null)[]; // plano de corte específico de CADA bobina em `coils`, 1:1, na mesma ordem
  combination: SlitterCombination | null; // = combinations[0] — mantido para telas que só exibem 1 preview
  coverageTon: number; // estoque de slitter + bobinas escolhidas
  coveragePercent: number;
  isFullyCovered: boolean;
}

export interface PlanOpParams {
  mainProduct: Product;
  larguraFita: number;
  espessura: number;
  totalDemandaT: number;
  compatibleProducts: Product[];
  availableCoils: Coil[]; // já filtrado por status 'Disponível'
  intermediarySlitters?: SlitterIntermediaryItem[];
  // Outros produtos do mesmo ferramental (ver SlitterOptimizer.demandSplitGroup)
  // — repassado ao otimizador para que a demanda de CADA produto do grupo
  // apareça no plano de corte, não só a do mainProduct.
  demandSplitGroup?: { product: Product; demandaT: number }[];
}

/**
 * Motor único de montagem da "melhor OP": cruza demanda, estoque de slitter
 * intermediário (fitas já cortadas), estoque de bobina matriz e aproveitamento
 * de corte (banda 10-18mm) para decidir o que efetivamente precisa ser cortado.
 *
 * Regra de negócio: fitas de slitter já cortadas e disponíveis na baia
 * intermediária são sempre priorizadas antes de cortar uma bobina matriz nova —
 * por isso a demanda "efetiva" de corte é a demanda total menos esse estoque.
 */
export class OpPlannerService {
  static plan(params: PlanOpParams): OpPlan {
    const {
      mainProduct,
      larguraFita,
      espessura,
      totalDemandaT,
      compatibleProducts,
      availableCoils,
      intermediarySlitters = [],
      demandSplitGroup
    } = params;

    const wipAvailableTon = Number(
      intermediarySlitters
        .filter(it => it.larguraFita === larguraFita && Math.abs(it.espessura - espessura) < 0.001)
        .reduce((acc, it) => acc + it.pesoDisponivelTon, 0)
        .toFixed(2)
    );

    const effectiveDemandTon = Math.max(0, Number((totalDemandaT - wipAvailableTon).toFixed(2)));
    const coveredByWipOnly = totalDemandaT > 0 && effectiveDemandTon <= 0;

    if (coveredByWipOnly) {
      return {
        totalDemandaT,
        wipAvailableTon,
        effectiveDemandTon: 0,
        coveredByWipOnly: true,
        coils: [],
        totalCoilsWeightTon: 0,
        combinations: [],
        combination: null,
        coverageTon: Math.min(wipAvailableTon, totalDemandaT),
        coveragePercent: 100,
        isFullyCovered: true
      };
    }

    const matchingCoils = availableCoils.filter(c => Math.abs(c.espessura - espessura) < 0.001);

    if (matchingCoils.length === 0) {
      return {
        totalDemandaT,
        wipAvailableTon,
        effectiveDemandTon,
        coveredByWipOnly: false,
        coils: [],
        totalCoilsWeightTon: 0,
        combinations: [],
        combination: null,
        coverageTon: wipAvailableTon,
        coveragePercent: totalDemandaT > 0 ? Math.round((wipAvailableTon / totalDemandaT) * 100) : 0,
        isFullyCovered: false
      };
    }

    // A demanda manda: monta o conjunto de bobinas até cobrir as toneladas
    // pendentes de cada item (produção de cada item limitada à demanda dele).
    // Cada passo escolhe a bobina cujo melhor corte atende mais demanda ainda
    // descoberta; se alguma bobina cobre tudo sozinha, vence a de maior
    // aproveitamento. Cada bobina recebe seu próprio plano de corte.
    const ratio = totalDemandaT > 0 ? effectiveDemandTon / totalDemandaT : 1;
    const focusGroup = demandSplitGroup && demandSplitGroup.length > 0
      ? demandSplitGroup.filter(g => Math.abs(g.product.espessura - espessura) < 0.001)
      : [{ product: mainProduct, demandaT: totalDemandaT }];
    const focusIds = new Set(focusGroup.map(g => g.product.id));

    const remaining = new Map<string, number>();
    compatibleProducts
      .filter(p => Math.abs(p.espessura - espessura) < 0.001 && (p.demandaT || 0) > 0)
      .forEach(p => remaining.set(p.id, p.demandaT || 0));
    focusGroup.forEach(g => remaining.set(g.product.id, Number((Math.max(0, g.demandaT || 0) * ratio).toFixed(3))));

    let focusRemaining = focusGroup.reduce((acc, g) => acc + (remaining.get(g.product.id) ?? 0), 0);
    const tolerance = 0.05;

    const pool = [...matchingCoils].sort((a, b) => b.peso - a.peso).slice(0, 10);
    const chosenCoils: Coil[] = [];
    const combinations: (SlitterCombination | null)[] = [];
    let focusCoveredTotal = 0;

    while (pool.length > 0 && focusRemaining > tolerance && chosenCoils.length < 8) {
      const demandObj = Object.fromEntries(remaining);
      const evaluated = pool
        .map(coil => {
          const combos = SlitterOptimizer.optimize({
            mainProduct,
            desiredQuantityTon: focusRemaining,
            selectedCoil: coil,
            compatibleProducts,
            minScrapMm: 10,
            maxScrapAllowedMm: 18,
            demandSplitGroup,
            demandaPorProduto: demandObj
          });
          const top = combos[0];
          if (!top) return null;
          const cov = SlitterOptimizer.computeCoverage(top, coil, remaining, focusIds);
          return { coil, top, cov };
        })
        .filter((e): e is NonNullable<typeof e> => !!e && e.cov.focusCoveredT > 0);

      if (evaluated.length === 0) break;

      const full = evaluated.filter(e => e.cov.focusCoveredT >= focusRemaining - tolerance);
      const best = full.length > 0
        ? full.sort((a, b) => b.top.aproveitamentoPercent - a.top.aproveitamentoPercent || a.coil.peso - b.coil.peso)[0]
        : evaluated.sort((a, b) => b.cov.focusCoveredT - a.cov.focusCoveredT || b.top.aproveitamentoPercent - a.top.aproveitamentoPercent)[0];

      chosenCoils.push(best.coil);
      combinations.push(best.top);
      focusCoveredTotal += best.cov.focusCoveredT;
      focusRemaining -= best.cov.focusCoveredT;
      best.cov.producedByProduct.forEach((t, id) => remaining.set(id, Math.max(0, (remaining.get(id) ?? 0) - t)));
      pool.splice(pool.findIndex(c => c.id === best.coil.id), 1);
    }

    const totalCoilsWeightTon = Number(chosenCoils.reduce((acc, c) => acc + c.peso, 0).toFixed(3));
    const coverageTon = Number((wipAvailableTon + focusCoveredTotal / (ratio || 1)).toFixed(2));
    const cappedCoverage = Math.min(coverageTon, totalDemandaT);

    return {
      totalDemandaT,
      wipAvailableTon,
      effectiveDemandTon,
      coveredByWipOnly: false,
      coils: chosenCoils,
      totalCoilsWeightTon,
      combinations,
      combination: combinations[0] || null,
      coverageTon: cappedCoverage,
      coveragePercent: totalDemandaT > 0 ? Math.min(100, Math.round((cappedCoverage / totalDemandaT) * 100)) : 100,
      isFullyCovered: totalDemandaT > 0 ? cappedCoverage >= totalDemandaT - tolerance : chosenCoils.length > 0
    };
  }
}
