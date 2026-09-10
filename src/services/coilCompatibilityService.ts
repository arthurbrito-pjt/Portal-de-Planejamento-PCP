import { Coil, Product, SlitterIntermediaryItem } from '../types/pcp';

export interface RankedCoil {
  coil: Coil;
  isWip: boolean;
  wipAvailableTon: number;
  fitasPossiveis: number;
  sobraMm: number;
  isSobraNaFaixa: boolean;
  violaPoliticaVolume: boolean;
}

export class CoilCompatibilityService {
  /**
   * Rank coils compatible with a product by: estoque intermediário (WIP) primeiro,
   * depois viabilidade de largura/sobra (banda 10-18mm), depois maior peso.
   */
  static rank(
    coils: Coil[],
    product: Product,
    intermediarySlitters: SlitterIntermediaryItem[] = []
  ): RankedCoil[] {
    const wipTon = this.getIntermediaryStockTon(product, intermediarySlitters);

    const ranked: RankedCoil[] = coils
      .filter(c => c.status === 'Disponível' && Math.abs(c.espessura - product.espessura) < 0.001)
      .map(coil => {
        const fitasPossiveis = Math.floor(coil.largura / product.larguraFita);
        const sobraMm = coil.largura - fitasPossiveis * product.larguraFita;
        const isSobraNaFaixa = sobraMm >= 10 && sobraMm <= 18;
        const violaPoliticaVolume = !!product.volumePoliticaT && (
          coil.peso < product.volumePoliticaT.minimo || coil.peso > product.volumePoliticaT.maximo
        );

        return {
          coil,
          isWip: wipTon > 0,
          wipAvailableTon: wipTon,
          fitasPossiveis,
          sobraMm,
          isSobraNaFaixa,
          violaPoliticaVolume
        };
      });

    return ranked.sort((a, b) => {
      if (a.isSobraNaFaixa !== b.isSobraNaFaixa) return a.isSobraNaFaixa ? -1 : 1;
      return b.coil.peso - a.coil.peso;
    });
  }

  static getIntermediaryStockTon(product: Product, intermediarySlitters: SlitterIntermediaryItem[] = []): number {
    return Number(
      intermediarySlitters
        .filter(it => it.larguraFita === product.larguraFita && Math.abs(it.espessura - product.espessura) < 0.001)
        .reduce((acc, it) => acc + it.pesoDisponivelTon, 0)
        .toFixed(2)
    );
  }
}
