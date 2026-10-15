import { Product, Coil, SlitterCombination, SlitterStrip } from '../types/pcp';
import { RefiloService } from './refiloService';

export interface OptimizationParams {
  mainProduct: Product;
  desiredQuantityTon: number;
  selectedCoil: Coil;
  compatibleProducts: Product[];
  minScrapMm?: number; // STRICT: minimum 12mm
  maxScrapAllowedMm?: number; // STRICT: maximum 18mm (~1.5%)
  // Outros produtos que compartilham o MESMO ferramental (largura de fita +
  // espessura) do mainProduct, cada um com sua própria demanda pendente — ex:
  // TBI20851 (9t) e TBI20970 (88t) saem do mesmo slitter de 399mm. Sem isso,
  // TODAS as fitas dessa largura eram atribuídas 100% ao mainProduct, fazendo
  // a demanda dos demais itens do grupo "sumir" do plano de corte. Quando
  // informado, as fitas da largura principal são rateadas proporcionalmente
  // à demanda de cada produto do grupo (método do maior resto).
  demandSplitGroup?: { product: Product; demandaT: number }[];
  // Demanda pendente (t) por produto, que sobrepõe a demanda cadastrada — usado
  // para planos com várias bobinas, onde cada bobina atende o que as anteriores
  // não cobriram.
  demandaPorProduto?: Record<string, number>;
}

const STRIP_COLORS = [
  '#0B1F3A', // cedisa-navy
  '#FF6B00', // cedisa-orange
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#14b8a6', // teal-500
  '#84cc16', // lime-500
];

export class SlitterOptimizer {
  /**
   * Find all optimal slitter combinations for a selected coil and main product.
   * STRICT MANDATE: Scrap MUST be between 12mm and 18mm (never < 12mm).
   */
  static optimize(params: OptimizationParams): SlitterCombination[] {
    const {
      mainProduct,
      selectedCoil,
      compatibleProducts,
      minScrapMm = 12,
      maxScrapAllowedMm = 18,
      demandSplitGroup,
      demandaPorProduto
    } = params;

    const coilWidth = selectedCoil.largura;
    const mainWidth = mainProduct.larguraFita;

    const rawResults: SlitterCombination[] = [];
    const seenSignatures = new Set<string>();

    // Filter companion products with the exact same thickness
    const candidates = compatibleProducts.filter(
      p => Math.abs(p.espessura - selectedCoil.espessura) < 0.001
    );

    // Grupo para ratear as fitas da largura principal (mainWidth) entre todos
    // os produtos que saem desse mesmo ferramental — nunca só o mainProduct.
    const splitGroup = (demandSplitGroup && demandSplitGroup.length > 1)
      ? demandSplitGroup.filter(g => Math.abs(g.product.espessura - selectedCoil.espessura) < 0.001)
      : null;

    const demandMap = this.buildDemandMap(params, splitGroup);
    const focusIds = new Set<string>(splitGroup ? splitGroup.map(g => g.product.id) : [mainProduct.id]);
    const tonPerMm = selectedCoil.peso / selectedCoil.largura;

    const maxMainCount = Math.floor(coilWidth / mainWidth);

    // Sem passar da demanda: parte do nº de fitas que atende a demanda do grupo
    // principal (sem demanda informada, parte do máximo que cabe na bobina).
    const focusDemand = Array.from(focusIds).reduce((acc, id) => acc + (demandMap.get(id) ?? 0), 0);
    const mainStripWeight = tonPerMm * mainWidth;
    const kStart = focusDemand > 0 && mainStripWeight > 0
      ? Math.max(1, Math.min(maxMainCount, Math.ceil(focusDemand / mainStripWeight)))
      : maxMainCount;

    // Nº de fitas do produto principal: perto do que a demanda pede e também perto
    // do máximo da bobina — este último serve para preencher a bobina quando não
    // há outros itens para completar (o excedente resultante exige autorização).
    const kSet = new Set<number>();
    for (let k = kStart; k >= Math.max(1, kStart - 4); k--) kSet.add(k);
    for (let k = maxMainCount; k >= Math.max(1, maxMainCount - 4); k--) kSet.add(k);
    const kList = Array.from(kSet).sort((a, b) => b - a);

    // 1. Check pure main product cut (single product)
    for (const k of kList) {
      const usedWidth = k * mainWidth;
      const scrap = coilWidth - usedWidth;

      const mainFitas = splitGroup
        ? this.splitQuantidadeByDemand(k, splitGroup, mainWidth)
        : [{ product: mainProduct, quantidade: k, larguraTotal: usedWidth }];

      // Only add single cut if scrap >= minScrapMm
      if (scrap >= minScrapMm) {
        const singleComb = this.buildCombination(
          selectedCoil,
          mainFitas,
          `Corte Exclusivo: ${k}x ${mainProduct.descricao} (${mainWidth}mm)`,
          demandMap,
          focusIds
        );

        const sig = this.getSignature(singleComb);
        if (!seenSignatures.has(sig)) {
          seenSignatures.add(sig);
          rawResults.push(singleComb);
        }
      }

      // Search complementary combinations for remaining space
      if (scrap > minScrapMm) {
        const companionSolutions = this.findComplements(
          scrap,
          candidates.filter(c => !focusIds.has(c.id)),
          minScrapMm,
          maxScrapAllowedMm,
          demandMap,
          tonPerMm
        );

        for (const comp of companionSolutions) {
          const combinedFitas = [
            ...mainFitas,
            ...comp.items
          ];

          const desc = `${k}x ${mainProduct.descricao.slice(0, 25)} + ${comp.items.map(i => `${i.quantidade}x ${i.product.descricao.slice(0, 20)}`).join(' + ')}`;

          const comb = this.buildCombination(
            selectedCoil,
            combinedFitas,
            desc,
            demandMap,
            focusIds
          );

          const cSig = this.getSignature(comb);
          if (!seenSignatures.has(cSig)) {
            seenSignatures.add(cSig);
            rawResults.push(comb);
          }
        }
      }
    }

    // 2. Nunca menos de 12mm de refilo. Quem não passa da demanda vem antes de
    // quem passa (esses só seguem com autorização), e dentro de cada grupo a
    // faixa 12-18mm vem primeiro. O refilo na faixa manda: a bobina é preenchida
    // com outros itens e, se preciso, com excedente (que exige autorização).
    // Plano só é válido com refilo de 6–9 mm por lado e 12–18 mm no total.
    const finalPool = rawResults.filter(r => r.sobraMm >= minScrapMm && r.refiloValido !== false);
    const inRange = (r: SlitterCombination) => r.sobraMm >= minScrapMm && r.sobraMm <= maxScrapAllowedMm;

    // Rank combinations:
    // 0. Sem excedente de demanda
    // 1. Faixa de refilo 12-18mm
    // 2. Maior demanda do produto/grupo principal atendida (t)
    // 3. Maior demanda total atendida (t)
    // 4. Highest utilization (aproveitamentoPercent)
    // 5. Minimum refilo/scrap (sobraMm) within valid range
    // 6. Higher count of main product strips
    finalPool.sort((a, b) => {
      if (inRange(a) !== inRange(b)) return inRange(a) ? -1 : 1;
      // Fora da faixa: o melhor aproveitamento da bobina (menor refilo) vem primeiro.
      if (!inRange(a) && Math.abs(a.sobraMm - b.sobraMm) > 0.1) return a.sobraMm - b.sobraMm;
      if (!!a.excedeDemanda !== !!b.excedeDemanda) return a.excedeDemanda ? 1 : -1;
      const exA = a.excedenteT ?? 0;
      const exB = b.excedenteT ?? 0;
      if (Math.abs(exA - exB) > 0.05) return exA - exB;
      // 1º o produto/grupo do ferramental principal, 2º a demanda total atendida
      const fA = a.demandaFocoAtendidaT ?? 0;
      const fB = b.demandaFocoAtendidaT ?? 0;
      if (Math.abs(fB - fA) > 0.05) return fB - fA;
      const dA = a.demandaAtendidaT ?? 0;
      const dB = b.demandaAtendidaT ?? 0;
      if (Math.abs(dB - dA) > 0.05) return dB - dA;

      if (Math.abs(b.aproveitamentoPercent - a.aproveitamentoPercent) > 0.001) {
        return b.aproveitamentoPercent - a.aproveitamentoPercent;
      }

      if (Math.abs(a.sobraMm - b.sobraMm) > 0.1) {
        return a.sobraMm - b.sobraMm;
      }

      const aMainQty = a.fitas.find(f => f.product.id === mainProduct.id)?.quantidade || 0;
      const bMainQty = b.fitas.find(f => f.product.id === mainProduct.id)?.quantidade || 0;
      return bMainQty - aMainQty;
    });

    return finalPool.slice(0, 15);
  }

  /** Pontua um corte já definido (fitas fixas) com as mesmas métricas do otimizador — usado para repetir uma configuração de facas em outra bobina. */
  static evaluate(
    coil: Coil,
    fitas: { product: Product; quantidade: number; larguraTotal: number }[],
    descricao: string,
    demandMap: Map<string, number>,
    focusIds: Set<string>
  ): SlitterCombination {
    return this.buildCombination(coil, fitas, descricao, demandMap, focusIds);
  }

  /** Demanda pendente (t) por produto considerada ao pontuar cada corte. */
  private static buildDemandMap(
    params: OptimizationParams,
    splitGroup: { product: Product; demandaT: number }[] | null
  ): Map<string, number> {
    const { mainProduct, selectedCoil, compatibleProducts, desiredQuantityTon, demandaPorProduto } = params;
    const map = new Map<string, number>();
    compatibleProducts
      .filter(p => Math.abs(p.espessura - selectedCoil.espessura) < 0.001 && (p.demandaT || 0) > 0)
      .forEach(p => map.set(p.id, p.demandaT || 0));
    if (splitGroup) {
      splitGroup.forEach(g => map.set(g.product.id, Math.max(0, g.demandaT || 0)));
    } else if (desiredQuantityTon > 0) {
      map.set(mainProduct.id, desiredQuantityTon);
    }
    if (demandaPorProduto) {
      Object.entries(demandaPorProduto).forEach(([id, t]) => map.set(id, Math.max(0, t)));
    }
    return map;
  }

  /**
   * Toneladas de demanda que um corte atende: cada item produz peso proporcional
   * à largura total das fitas dele, limitado à demanda pendente do próprio item.
   */
  static computeCoverage(
    combination: SlitterCombination,
    coil: Coil,
    demand: Map<string, number>,
    focusIds?: Set<string>
  ): { coveredT: number; focusCoveredT: number; producedByProduct: Map<string, number> } {
    let coveredT = 0;
    let focusCoveredT = 0;
    const producedByProduct = new Map<string, number>();
    const widthByProduct = new Map<string, number>();
    combination.fitas.forEach(f => widthByProduct.set(f.product.id, (widthByProduct.get(f.product.id) ?? 0) + f.larguraTotal));
    for (const [productId, larguraTotal] of widthByProduct) {
      const produced = coil.peso * (larguraTotal / coil.largura);
      const pending = demand.get(productId) ?? 0;
      const covered = Math.min(produced, pending);
      coveredT += covered;
      if (!focusIds || focusIds.has(productId)) focusCoveredT += covered;
      producedByProduct.set(productId, covered);
    }
    return { coveredT, focusCoveredT, producedByProduct };
  }

  /**
   * Rateia `totalQuantidade` fitas de uma mesma largura entre todos os produtos
   * de `group` proporcionalmente à demanda de cada um (método do maior resto,
   * para garantir que a soma das quantidades inteiras bate exatamente com
   * `totalQuantidade`). Produtos sem demanda informada ficam de fora do rateio
   * (a menos que NINGUÉM do grupo tenha demanda — aí tudo vai para o primeiro,
   * que é sempre o mainProduct por convenção de quem chama).
   */
  private static splitQuantidadeByDemand(
    totalQuantidade: number,
    group: { product: Product; demandaT: number }[],
    larguraFita: number
  ): { product: Product; quantidade: number; larguraTotal: number }[] {
    const totalDemanda = group.reduce((acc, g) => acc + Math.max(0, g.demandaT || 0), 0);

    if (totalDemanda <= 0) {
      return [{ product: group[0].product, quantidade: totalQuantidade, larguraTotal: totalQuantidade * larguraFita }];
    }

    const exact = group.map(g => (Math.max(0, g.demandaT || 0) / totalDemanda) * totalQuantidade);
    const floors = exact.map(Math.floor);
    const allocated = floors.reduce((a, b) => a + b, 0);
    const remaining = totalQuantidade - allocated;

    const fracOrder = exact
      .map((v, idx) => ({ idx, frac: v - floors[idx] }))
      .sort((a, b) => b.frac - a.frac);

    const quantidades = [...floors];
    for (let i = 0; i < remaining; i++) {
      quantidades[fracOrder[i % fracOrder.length].idx]++;
    }

    return group
      .map((g, idx) => ({ product: g.product, quantidade: quantidades[idx], larguraTotal: quantidades[idx] * larguraFita }))
      .filter(f => f.quantidade > 0);
  }

  /**
   * Combinatorial helper to find companion items that sum up to target space with 12mm <= scrap <= 18mm
   */
  private static findComplements(
    targetSpace: number,
    candidates: Product[],
    minScrap: number,
    maxScrap: number,
    demandMap: Map<string, number>,
    tonPerMm: number
  ): { items: { product: Product; quantidade: number; larguraTotal: number }[]; scrap: number }[] {
    const validCandidates = candidates.filter(p => p.larguraFita <= targetSpace);
    const solutions: { items: { product: Product; quantidade: number; larguraTotal: number }[]; scrap: number }[] = [];

    // Sort candidate products by demand first, then by width descending
    validCandidates.sort((a, b) => {
      const demDiff = (b.demandaT || 0) - (a.demandaT || 0);
      if (Math.abs(demDiff) > 0.1) return demDiff;
      return b.larguraFita - a.larguraFita;
    });

    const topCandidates = validCandidates.slice(0, 30);

    // 1-item combinations (e.g. 1 or more strips of single companion product)
    for (const p of topCandidates) {
      const maxCount = Math.floor(targetSpace / p.larguraFita);
      for (let count = maxCount; count >= 1; count--) {
        const used = count * p.larguraFita;
        const remScrap = targetSpace - used;
        if (remScrap >= minScrap && remScrap <= maxScrap) {
          solutions.push({
            items: [{ product: p, quantidade: count, larguraTotal: used }],
            scrap: remScrap
          });
        }
      }
    }

    // 2-item combinations
    for (let i = 0; i < topCandidates.length; i++) {
      const p1 = topCandidates[i];
      const maxCount1 = Math.floor(targetSpace / p1.larguraFita);
      
      for (let count1 = maxCount1; count1 >= 1; count1--) {
        const used1 = count1 * p1.larguraFita;
        const rem1 = targetSpace - used1;
        if (rem1 <= 0) continue;

        for (let j = i + 1; j < topCandidates.length; j++) {
          const p2 = topCandidates[j];
          const maxCount2 = Math.floor(rem1 / p2.larguraFita);
          for (let count2 = maxCount2; count2 >= 1; count2--) {
            const used2 = count2 * p2.larguraFita;
            const finalScrap = rem1 - used2;
            if (finalScrap >= minScrap && finalScrap <= maxScrap) {
              solutions.push({
                items: [
                  { product: p1, quantidade: count1, larguraTotal: used1 },
                  { product: p2, quantidade: count2, larguraTotal: used2 }
                ],
                scrap: finalScrap
              });
            }
          }
        }
      }
    }

    // 3-item combinations for tightest fit / highest yield
    for (let i = 0; i < Math.min(topCandidates.length, 12); i++) {
      const p1 = topCandidates[i];
      const maxCount1 = Math.floor(targetSpace / p1.larguraFita);
      
      for (let count1 = maxCount1; count1 >= 1; count1--) {
        const used1 = count1 * p1.larguraFita;
        const rem1 = targetSpace - used1;
        if (rem1 <= 0) continue;

        for (let j = i + 1; j < Math.min(topCandidates.length, 15); j++) {
          const p2 = topCandidates[j];
          const maxCount2 = Math.floor(rem1 / p2.larguraFita);
          for (let count2 = maxCount2; count2 >= 1; count2--) {
            const used2 = count2 * p2.larguraFita;
            const rem2 = rem1 - used2;
            if (rem2 <= 0) continue;

            for (let k = j + 1; k < Math.min(topCandidates.length, 18); k++) {
              const p3 = topCandidates[k];
              const maxCount3 = Math.floor(rem2 / p3.larguraFita);
              for (let count3 = maxCount3; count3 >= 1; count3--) {
                const used3 = count3 * p3.larguraFita;
                const finalScrap = rem2 - used3;
                if (finalScrap >= minScrap && finalScrap <= maxScrap) {
                  solutions.push({
                    items: [
                      { product: p1, quantidade: count1, larguraTotal: used1 },
                      { product: p2, quantidade: count2, larguraTotal: used2 },
                      { product: p3, quantidade: count3, larguraTotal: used3 }
                    ],
                    scrap: finalScrap
                  });
                }
              }
            }
          }
        }
      }
    }

    // Prioriza o que atende mais demanda pendente; empate vai para o menor refilo.
    const coveredOf = (sol: { items: { product: Product; larguraTotal: number }[] }) =>
      sol.items.reduce(
        (acc, i) => acc + Math.min(i.larguraTotal * tonPerMm, demandMap.get(i.product.id) ?? 0),
        0
      );
    const excessOf = (sol: { items: { product: Product; larguraTotal: number }[] }) =>
      sol.items.reduce(
        (acc, i) => acc + Math.max(0, i.larguraTotal * tonPerMm - (demandMap.get(i.product.id) ?? 0)),
        0
      );
    const scored = solutions.map(sol => ({ sol, covered: coveredOf(sol), excess: excessOf(sol) }));
    scored.sort((a, b) => {
      if (Math.abs(b.covered - a.covered) > 0.05) return b.covered - a.covered;
      if (Math.abs(a.excess - b.excess) > 0.05) return a.excess - b.excess;
      return a.sol.scrap - b.sol.scrap;
    });

    return scored.slice(0, 20).map(x => x.sol);
  }

  /**
   * Build full combination object with metrics, classification, weights and badges
   */
  private static buildCombination(
    coil: Coil,
    fitas: { product: Product; quantidade: number; larguraTotal: number }[],
    descricao: string,
    demandMap: Map<string, number>,
    focusIds: Set<string>
  ): SlitterCombination {
    const totalLarguraUsada = fitas.reduce((acc, f) => acc + f.larguraTotal, 0);
    const sobraMm = Math.max(0, coil.largura - totalLarguraUsada);
    const aproveitamentoPercent = Number(((totalLarguraUsada / coil.largura) * 100).toFixed(2));
    const perdaPercent = Number(((sobraMm / coil.largura) * 100).toFixed(2));
    
    const pesoConsumidoTon = Number((coil.peso * (totalLarguraUsada / coil.largura)).toFixed(3));
    const pesoSobraTon = Number((coil.peso * (sobraMm / coil.largura)).toFixed(3));

    let classificacao: SlitterCombination['classificacao'] = 'BOM';
    let badgeTexto = `${aproveitamentoPercent}% Aproveitamento`;

    if (sobraMm >= 12 && sobraMm <= 18) {
      classificacao = 'PERFEITO';
      badgeTexto = `Refilo Conforme: ${sobraMm}mm (${perdaPercent}%)`;
    } else if (sobraMm < 12) {
      classificacao = 'ATENÇÃO';
      badgeTexto = `Refilo Inválido: ${sobraMm}mm (< 12mm)`;
    } else {
      classificacao = 'ATENÇÃO';
      badgeTexto = `Sobra Excedente: ${sobraMm}mm (> 18mm)`;
    }

    const hasPriorityDemand = fitas.some(f => (f.product.demandaT || 0) > 0);

    let demandaAtendidaT = 0;
    let focusCovered = 0;
    let excedenteT = 0;
    const widthByProduct = new Map<string, number>();
    fitas.forEach(f => widthByProduct.set(f.product.id, (widthByProduct.get(f.product.id) ?? 0) + f.larguraTotal));
    for (const [productId, larguraTotal] of widthByProduct) {
      const produced = coil.peso * (larguraTotal / coil.largura);
      const pending = demandMap.get(productId) ?? 0;
      const covered = Math.min(produced, pending);
      demandaAtendidaT += covered;
      if (focusIds.has(productId)) focusCovered += covered;
      // Produzir acima da demanda pendente (ou item sem demanda) é excedente.
      if (demandMap.size > 0 && produced - pending > Math.max(0.05, pending * 0.01)) {
        excedenteT += produced - pending;
      }
    }
    const refilo = RefiloService.calcular(sobraMm);
    const focusDemand = Array.from(focusIds).reduce((acc, id) => acc + (demandMap.get(id) ?? 0), 0);
    const atendimentoDemandaPercent = focusDemand > 0 ? Math.min(100, Math.round((focusCovered / focusDemand) * 100)) : 0;

    return {
      id: `COMB_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      descricao,
      fitas,
      totalLarguraUsada,
      sobraMm,
      aproveitamentoPercent,
      perdaPercent,
      pesoConsumidoTon,
      pesoSobraTon,
      classificacao,
      badgeTexto,
      prioridadeDemanda: hasPriorityDemand,
      demandaAtendidaT: Number(demandaAtendidaT.toFixed(3)),
      demandaFocoAtendidaT: Number(focusCovered.toFixed(3)),
      atendimentoDemandaPercent,
      excedenteT: Number(excedenteT.toFixed(3)),
      excedeDemanda: excedenteT > 0,
      refiloEsquerdoMm: refilo.esquerdoMm,
      refiloDireitoMm: refilo.direitoMm,
      refiloValido: refilo.valido
    };
  }

  /**
   * Helper to convert combination into array of individual SlitterStrips for visualizer & OS
   */
  static generateStripsFromCombination(
    combination: SlitterCombination,
    coil: Coil
  ): SlitterStrip[] {
    const strips: SlitterStrip[] = [];
    let seq = 1;

    combination.fitas.forEach((fGroup, gIdx) => {
      const color = STRIP_COLORS[gIdx % STRIP_COLORS.length];
      const p = fGroup.product;
      const stripWeightTon = Number((coil.peso * (p.larguraFita / coil.largura)).toFixed(3));
      const stripWeightKg = Math.round(stripWeightTon * 1000);
      
      const kgPerMeter = p.pesoPorMetro || (p.larguraFita * p.espessura * 7.85 / 1000);
      const linearMeters = kgPerMeter > 0 ? Math.round(stripWeightKg / kgPerMeter) : 0;

      for (let i = 0; i < fGroup.quantidade; i++) {
        strips.push({
          id: `STRIP_${seq}_${p.codigo}`,
          stripNumber: seq++,
          productId: p.id,
          productCode: p.codigo,
          productDescription: p.descricao,
          productFamily: p.familia,
          largura: p.larguraFita,
          espessura: coil.espessura,
          pesoTon: stripWeightTon,
          pesoKg: stripWeightKg,
          metrosLineares: linearMeters,
          cor: color
        });
      }
    });

    return strips;
  }

  private static getSignature(comb: SlitterCombination): string {
    const sorted = [...comb.fitas].sort((a, b) => a.product.codigo.localeCompare(b.product.codigo));
    return sorted.map(f => `${f.product.codigo}:${f.quantidade}`).join('|');
  }
}
