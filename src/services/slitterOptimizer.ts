import { Product, Coil, SlitterCombination, SlitterStrip } from '../types/pcp';

export interface OptimizationParams {
  mainProduct: Product;
  desiredQuantityTon: number;
  selectedCoil: Coil;
  compatibleProducts: Product[];
  minScrapMm?: number; // default 10mm
  maxScrapAllowedMm?: number; // default 18mm (~1.5%)
}

const STRIP_COLORS = [
  '#2563eb', // blue-600
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
];

export class SlitterOptimizer {
  /**
   * Find all optimal slitter combinations for a selected coil and main product
   * Target rule: 10mm <= Scrap <= 18mm (~1.5%)
   */
  static optimize(params: OptimizationParams): SlitterCombination[] {
    const {
      mainProduct,
      selectedCoil,
      compatibleProducts,
      minScrapMm = 10,
      maxScrapAllowedMm = 18
    } = params;

    const coilWidth = selectedCoil.largura;
    const mainWidth = mainProduct.larguraFita;

    const results: SlitterCombination[] = [];
    const seenSignatures = new Set<string>();

    // Filter companion products with the exact same thickness
    const candidates = compatibleProducts.filter(
      p => Math.abs(p.espessura - selectedCoil.espessura) < 0.001
    );

    const maxMainCount = Math.floor(coilWidth / mainWidth);

    // 1. Check pure main product cut (single product)
    for (let k = maxMainCount; k >= Math.max(1, maxMainCount - 3); k--) {
      const usedWidth = k * mainWidth;
      const scrap = coilWidth - usedWidth;
      
      const singleComb = this.buildCombination(
        selectedCoil,
        [{ product: mainProduct, quantidade: k, larguraTotal: usedWidth }],
        `Corte Exclusivo: ${k}x ${mainProduct.descricao} (${mainWidth}mm)`
      );
      
      const sig = this.getSignature(singleComb);
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        results.push(singleComb);
      }

      // Search complementary combinations for remaining space
      if (scrap > 0) {
        const companionSolutions = this.findComplements(
          scrap,
          candidates,
          mainProduct.id,
          maxScrapAllowedMm
        );

        for (const comp of companionSolutions) {
          const combinedFitas = [
            { product: mainProduct, quantidade: k, larguraTotal: k * mainWidth },
            ...comp.items
          ];

          const desc = `${k}x ${mainProduct.descricao.slice(0, 25)} + ${comp.items.map(i => `${i.quantidade}x ${i.product.descricao.slice(0, 20)}`).join(' + ')}`;
          
          const comb = this.buildCombination(
            selectedCoil,
            combinedFitas,
            desc
          );

          const cSig = this.getSignature(comb);
          if (!seenSignatures.has(cSig)) {
            seenSignatures.add(cSig);
            results.push(comb);
          }
        }
      }
    }

    // Rank combinations:
    // 1. Ideal conforming range: 10mm <= scrap <= 18mm first (Ideal ~1.5%)
    // 2. Scrap closest to 10-18mm window
    // 3. More main product strips
    // 4. Higher demand priority
    results.sort((a, b) => {
      const aInIdeal = a.sobraMm >= minScrapMm && a.sobraMm <= maxScrapAllowedMm ? 1 : 0;
      const bInIdeal = b.sobraMm >= minScrapMm && b.sobraMm <= maxScrapAllowedMm ? 1 : 0;
      if (aInIdeal !== bInIdeal) return bInIdeal - aInIdeal;

      // If both in ideal or both outside, rank by distance to optimal refilo (14mm midpoint)
      const aDist = Math.abs(a.sobraMm - 14);
      const bDist = Math.abs(b.sobraMm - 14);
      if (Math.abs(aDist - bDist) > 0.5) return aDist - bDist;

      // Priority to combinations with higher count of the main product
      const aMainQty = a.fitas.find(f => f.product.id === mainProduct.id)?.quantidade || 0;
      const bMainQty = b.fitas.find(f => f.product.id === mainProduct.id)?.quantidade || 0;
      if (aMainQty !== bMainQty) return bMainQty - aMainQty;

      return b.aproveitamentoPercent - a.aproveitamentoPercent;
    });

    return results.slice(0, 15);
  }

  /**
   * Combinatorial helper to find companion items that sum up to target width with scrap <= maxScrap
   */
  private static findComplements(
    targetSpace: number,
    candidates: Product[],
    excludeProductId: string,
    maxScrap: number
  ): { items: { product: Product; quantidade: number; larguraTotal: number }[]; scrap: number }[] {
    const validCandidates = candidates.filter(p => p.larguraFita <= targetSpace);
    const solutions: { items: { product: Product; quantidade: number; larguraTotal: number }[]; scrap: number }[] = [];

    // Prioritize products with active demand
    validCandidates.sort((a, b) => (b.demandaT || 0) - (a.demandaT || 0));

    // Limit to top 25 candidate products to keep search fast (< 5ms)
    const topCandidates = validCandidates.slice(0, 25);

    // 1-item combinations (e.g. 1 or more strips of single companion product)
    for (const p of topCandidates) {
      const maxCount = Math.floor(targetSpace / p.larguraFita);
      for (let count = maxCount; count >= 1; count--) {
        const used = count * p.larguraFita;
        const remScrap = targetSpace - used;
        if (remScrap <= maxScrap && remScrap >= 0) {
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
            if (finalScrap <= maxScrap && finalScrap >= 0) {
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

    // Prioritize solutions within 10mm <= scrap <= 18mm
    solutions.sort((a, b) => {
      const aIdeal = a.scrap >= 10 && a.scrap <= 18 ? 1 : 0;
      const bIdeal = b.scrap >= 10 && b.scrap <= 18 ? 1 : 0;
      if (aIdeal !== bIdeal) return bIdeal - aIdeal;
      return a.scrap - b.scrap;
    });

    return solutions.slice(0, 12);
  }

  /**
   * Build full combination object with metrics, classification, weights and badges
   */
  private static buildCombination(
    coil: Coil,
    fitas: { product: Product; quantidade: number; larguraTotal: number }[],
    descricao: string
  ): SlitterCombination {
    const totalLarguraUsada = fitas.reduce((acc, f) => acc + f.larguraTotal, 0);
    const sobraMm = Math.max(0, coil.largura - totalLarguraUsada);
    const aproveitamentoPercent = Number(((totalLarguraUsada / coil.largura) * 100).toFixed(2));
    const perdaPercent = Number(((sobraMm / coil.largura) * 100).toFixed(2));
    
    const pesoConsumidoTon = Number((coil.peso * (totalLarguraUsada / coil.largura)).toFixed(3));
    const pesoSobraTon = Number((coil.peso * (sobraMm / coil.largura)).toFixed(3));

    let classificacao: SlitterCombination['classificacao'] = 'BOM';
    let badgeTexto = `${aproveitamentoPercent}% Aproveitamento`;

    if (sobraMm >= 10 && sobraMm <= 18) {
      classificacao = 'PERFEITO';
      badgeTexto = `Ideal: Refilo ${sobraMm}mm (${perdaPercent}%)`;
    } else if (sobraMm < 10) {
      classificacao = 'EXCELENTE';
      badgeTexto = `Refilo Reduzido: ${sobraMm}mm (< 10mm)`;
    } else if (sobraMm <= 25) {
      classificacao = 'BOM';
      badgeTexto = `Sobra: ${sobraMm}mm (${perdaPercent}%)`;
    } else {
      classificacao = 'ATENÇÃO';
      badgeTexto = `Sobra Alta: ${sobraMm}mm (> 18mm)`;
    }

    const hasPriorityDemand = fitas.some(f => (f.product.demandaT || 0) > 0);

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
      prioridadeDemanda: hasPriorityDemand
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
