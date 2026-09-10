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
      intermediarySlitters = []
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

    // 1. Tenta a MELHOR bobina única (maior aproveitamento) que sozinha cubra a demanda efetiva
    let bestSingle: { coil: Coil; combination: SlitterCombination } | null = null;
    for (const coil of matchingCoils) {
      if (coil.peso < effectiveDemandTon) continue;
      const combos = SlitterOptimizer.optimize({
        mainProduct,
        desiredQuantityTon: effectiveDemandTon,
        selectedCoil: coil,
        compatibleProducts,
        minScrapMm: 10,
        maxScrapAllowedMm: 18
      });
      const top = combos[0];
      if (top && (!bestSingle || top.aproveitamentoPercent > bestSingle.combination.aproveitamentoPercent)) {
        bestSingle = { coil, combination: top };
      }
    }

    if (bestSingle) {
      const totalCoilsWeightTon = bestSingle.coil.peso;
      const coverageTon = Number((wipAvailableTon + totalCoilsWeightTon).toFixed(2));
      return {
        totalDemandaT,
        wipAvailableTon,
        effectiveDemandTon,
        coveredByWipOnly: false,
        coils: [bestSingle.coil],
        totalCoilsWeightTon,
        combinations: [bestSingle.combination],
        combination: bestSingle.combination,
        coverageTon,
        coveragePercent: totalDemandaT > 0 ? Math.min(100, Math.round((coverageTon / totalDemandaT) * 100)) : 100,
        isFullyCovered: coverageTon >= totalDemandaT
      };
    }

    // 2. Nenhuma bobina sozinha cobre a demanda efetiva — combina múltiplas bobinas
    // (maior peso primeiro). Cada bobina física é cortada de forma independente,
    // então cada uma recebe seu PRÓPRIO plano de corte (largura/aproveitamento
    // podem diferir entre bobinas) — nunca reaproveita a combinação de uma bobina
    // para "representar" o peso somado das demais.
    const sortedByWeight = [...matchingCoils].sort((a, b) => b.peso - a.peso);
    const chosenCoils: Coil[] = [];
    let accum = 0;
    for (const c of sortedByWeight) {
      chosenCoils.push(c);
      accum += c.peso;
      if (accum >= effectiveDemandTon) break;
    }

    const combinations: (SlitterCombination | null)[] = chosenCoils.map(coil => {
      const combos = SlitterOptimizer.optimize({
        mainProduct,
        desiredQuantityTon: effectiveDemandTon,
        selectedCoil: coil,
        compatibleProducts,
        minScrapMm: 10,
        maxScrapAllowedMm: 18
      });
      return combos[0] || null;
    });

    const totalCoilsWeightTon = Number(chosenCoils.reduce((acc, c) => acc + c.peso, 0).toFixed(3));
    const coverageTon = Number((wipAvailableTon + totalCoilsWeightTon).toFixed(2));

    return {
      totalDemandaT,
      wipAvailableTon,
      effectiveDemandTon,
      coveredByWipOnly: false,
      coils: chosenCoils,
      totalCoilsWeightTon,
      combinations,
      combination: combinations[0] || null,
      coverageTon,
      coveragePercent: totalDemandaT > 0 ? Math.min(100, Math.round((coverageTon / totalDemandaT) * 100)) : 100,
      isFullyCovered: coverageTon >= totalDemandaT
    };
  }
}
