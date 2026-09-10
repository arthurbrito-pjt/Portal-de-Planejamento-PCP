import { 
  Product, 
  Coil, 
  SlitterOrder, 
  Ferramental, 
  SlitterIntermediaryItem, 
  CotacaoPrevisaoItem, 
  GrauDificuldade 
} from '../types/pcp';
import { SlitterCatalogService } from './slitterCatalogService';

export class ProductionForecastService {
  /**
   * Calcula a previsão de produção para a área de cotação comercial.
   * REGRA DE NEGÓCIO: Sempre 2 dias a mais a partir do momento em que foi iniciado o corte/produção (D+2).
   */
  static calculateItemForecast(
    product: Product,
    coils: Coil[],
    orders: SlitterOrder[],
    intermediarySlitters: SlitterIntermediaryItem[],
    ferramentais: Ferramental[]
  ): CotacaoPrevisaoItem {
    const sltInfo = SlitterCatalogService.getSlitterInfo(product.larguraFita, product.espessura, product);

    // 1. Verifica ferramental associado e lote mínimo
    const matchedFerramental = ferramentais.find(
      f => f.codigo === sltInfo.code || f.nome.toLowerCase().includes(sltInfo.code.toLowerCase())
    );

    const loteMinimoRecomendadoT = matchedFerramental?.capacidadeMinimaT 
      || product.volumePoliticaT?.minimo 
      || (product.familia === 'TUBO' ? 10 : 8);

    // Grau de dificuldade
    let grauDificuldade: GrauDificuldade = product.grauDificuldade || 'MEDIO';
    if (!product.grauDificuldade) {
      if (product.espessura <= 1.25 || product.espessura >= 4.75) {
        grauDificuldade = 'ALTO';
      } else if (product.espessura === 1.5 || product.espessura === 1.8 || product.espessura === 2.0) {
        grauDificuldade = 'BAIXO';
      }
    }

    // 2. Verifica estoque intermediário de slitters prontos
    const matchingIntermediary = intermediarySlitters.filter(
      s => Math.abs(s.espessura - product.espessura) < 0.001 && 
           Math.abs(s.larguraFita - product.larguraFita) < 1.0 &&
           s.pesoDisponivelTon > 0
    );
    const estoqueIntermediarioDisponivelTon = Number(
      matchingIntermediary.reduce((acc, s) => acc + s.pesoDisponivelTon, 0).toFixed(2)
    );

    // 3. Verifica bobinas compatíveis em estoque (inclui Físico com pendência contábil para não parar)
    const matchingCoils = coils.filter(
      c => c.status === 'Disponível' && 
           Math.abs(c.espessura - product.espessura) < 0.001 &&
           c.largura >= product.larguraFita
    );
    const bobinasCompativeisTon = Number(
      matchingCoils.reduce((acc, c) => acc + c.peso, 0).toFixed(2)
    );

    // 4. Verifica ordens de produção em andamento
    const activeOrdersWithProduct = orders.filter(o => 
      (o.status === 'Em Corte' || o.status === 'Liberada' || o.status === 'Planejada') &&
      o.fitas.some(f => f.productId === product.id || f.productCode === product.codigo)
    );

    // Cenário A: Temos Fita de Slitter pronta em estoque intermediário
    if (estoqueIntermediarioDisponivelTon >= (product.demandaT || 5)) {
      return {
        produto: product,
        diasPrevisao: 1,
        dataPrevisaoTexto: 'Pronta Entrega / D+1 (Slitter Pronto no Galpão)',
        statusAtendimento: 'PRONTA_ENTREGA',
        origemMaterial: 'ESTOQUE_SLITTER',
        loteMinimoRecomendadoT,
        grauDificuldade,
        detalhePrevisao: `Existem ${estoqueIntermediarioDisponivelTon}t de fitas de slitter cortadas em estoque intermediário. Alimentação imediata na linha de conformação.`,
        estoqueIntermediarioDisponivelTon,
        bobinasCompativeisTon
      };
    }

    // Cenário B: Ordem em corte ou iniciada hoje (Regra estrita D+2)
    const isCuttingNow = activeOrdersWithProduct.some(o => o.status === 'Em Corte');
    if (isCuttingNow) {
      const targetDate = this.addBusinessDays(new Date(), 2);
      return {
        produto: product,
        diasPrevisao: 2,
        dataPrevisaoTexto: `D+2 (${targetDate}) — Em Produção Ativa`,
        statusAtendimento: 'EM_PRODUCAO_D2',
        origemMaterial: 'BOBINA_DISPONIVEL',
        loteMinimoRecomendadoT,
        grauDificuldade,
        detalhePrevisao: 'Bobina em corte na máquina hoje. Disponibilidade do tubo/perfil inspecionado e embalado em exatamente 2 dias úteis.',
        estoqueIntermediarioDisponivelTon,
        bobinasCompativeisTon
      };
    }

    // Cenário C: Ordem já programada ou bobinas disponíveis em estoque
    if (activeOrdersWithProduct.length > 0 || bobinasCompativeisTon > 0) {
      const targetDate = this.addBusinessDays(new Date(), 3);
      const isApenasFisico = matchingCoils.some(c => c.statusContabil === 'PENDENTE_AJUSTE');
      const obsContabil = isApenasFisico ? ' (Produção autorizada via estoque físico na baia)' : '';

      return {
        produto: product,
        diasPrevisao: 3,
        dataPrevisaoTexto: `D+3 (${targetDate}) — MP Disponível`,
        statusAtendimento: 'PROGRAMADO_D3',
        origemMaterial: 'BOBINA_DISPONIVEL',
        loteMinimoRecomendadoT,
        grauDificuldade,
        detalhePrevisao: `Bobinas disponíveis no estoque (${bobinasCompativeisTon}t)${obsContabil}. 1 dia de fila/corte slitter + 2 dias de conformação (Regra D+2 após início).`,
        estoqueIntermediarioDisponivelTon,
        bobinasCompativeisTon
      };
    }

    // Cenário D: Sem Matéria-Prima
    return {
      produto: product,
      diasPrevisao: 15,
      dataPrevisaoTexto: 'Sem Previsão Firme (Aguardando Bobina de Aço)',
      statusAtendimento: 'AGUARDANDO_MP',
      origemMaterial: 'SEM_BOBINA',
      loteMinimoRecomendadoT,
      grauDificuldade,
      detalhePrevisao: 'Sem bobinas compatíveis no estoque físico ou contábil. Necessário pedido de compra de bobina na usina ou transferência entre filiais.',
      estoqueIntermediarioDisponivelTon,
      bobinasCompativeisTon: 0
    };
  }

  /**
   * Gera previsões em lote para toda a carteira de produtos.
   */
  static generateAllForecasts(
    products: Product[],
    coils: Coil[],
    orders: SlitterOrder[],
    intermediarySlitters: SlitterIntermediaryItem[],
    ferramentais: Ferramental[]
  ): CotacaoPrevisaoItem[] {
    return products.map(p => 
      this.calculateItemForecast(p, coils, orders, intermediarySlitters, ferramentais)
    );
  }

  private static addBusinessDays(startDate: Date, days: number): string {
    const result = new Date(startDate);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Pula sábado e domingo
        added++;
      }
    }
    const day = String(result.getDate()).padStart(2, '0');
    const month = String(result.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }
}
