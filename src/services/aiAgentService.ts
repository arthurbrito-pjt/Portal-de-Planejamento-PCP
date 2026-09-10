import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { Product, Coil, SlitterOrder, PCPKPIs, CutHistoryItem, AIAgentResult } from '../types/pcp';
import { ReadinessService } from './readinessService';

export type AIAgentMode = 'recommendations' | 'alerts' | 'summary';

interface AIAgentContextArgs {
  products: Product[];
  coils: Coil[];
  orders: SlitterOrder[];
  kpis: PCPKPIs;
  history: CutHistoryItem[];
}

/**
 * Monta o "snapshot" de dados enviado ao agente de IA, reaproveitando o
 * mesmo motor determinístico (ReadinessService / SlitterOptimizer) já usado
 * no Painel Geral. A IA não recalcula cortes — ela prioriza, explica e
 * resume o que o motor de otimização já produziu.
 */
function buildContext({ products, coils, orders, kpis, history }: AIAgentContextArgs) {
  const programs = ReadinessService.generateSlitterPrograms(products, coils).slice(0, 12);
  const demandItems = ReadinessService
    .sortSlittersByReadiness(ReadinessService.analyzeSlitters(products, coils))
    .slice(0, 15);

  const availableCoils = coils.filter(c => c.status === 'Disponível');

  return {
    kpis,
    estoque: {
      totalBobinasDisponiveis: availableCoils.length,
      bobinas: availableCoils.slice(0, 60).map(c => ({
        codigo: c.codigo,
        lote: c.lote,
        largura: c.largura,
        espessura: c.espessura,
        pesoTon: c.peso
      }))
    },
    demandas: demandItems.map(d => ({
      slitter: d.nomeSlitter,
      larguraFita: d.larguraFita,
      espessura: d.espessura,
      demandaTotalTon: d.totalDemandaT,
      status: d.status,
      coveragePercent: d.coveragePercent,
      lotesCompativeis: d.compatibleLotCount
    })),
    programasSugeridos: programs.map(p => ({
      id: p.id,
      bobinaCodigo: p.coil.codigo,
      bobinaLote: p.coil.lote,
      produtoPrincipal: p.mainProduct.descricao,
      aproveitamentoPercent: p.aproveitamentoPercent,
      sobraMm: p.sobraMm,
      status: p.status,
      totalFitas: p.totalFitas
    })),
    ordensRecentes: orders.slice(-10).map(o => ({
      numeroOP: o.numeroOP || o.numeroOS || o.id,
      status: o.status,
      aproveitamentoPercent: o.aproveitamentoPercent,
      dataCriacao: o.dataCriacao
    })),
    historicoRecente: history.slice(-15)
  };
}

export class AIAgentService {
  static async run(mode: AIAgentMode, args: AIAgentContextArgs): Promise<AIAgentResult> {
    const context = buildContext(args);
    const callable = httpsCallable(functions, 'aiAgentAssistant');
    const response = await callable({ mode, context });
    return response.data as AIAgentResult;
  }

  /** Encontra o programa de corte sugerido (para "Aplicar") a partir do id retornado pela IA. */
  static findProgramById(products: Product[], coils: Coil[], programId: string) {
    return ReadinessService.generateSlitterPrograms(products, coils).find(p => p.id === programId) || null;
  }
}
