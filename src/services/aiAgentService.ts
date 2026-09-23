import { Product, Coil, SlitterOrder, PCPKPIs, CutHistoryItem, Ferramental, SlitterIntermediaryItem, AIAgentResult, AIProvider } from '../types/pcp';
import { ReadinessService } from './readinessService';

export type AIAgentMode = 'recommendations' | 'planning' | 'alerts' | 'summary';

const AI_PROVIDER_STORAGE_KEY = 'pcp_ai_provider_v1';

// URL do Cloudflare Worker que hospeda o Agente de IA (chaves de API ficam
// como Worker Secrets, nunca no navegador — ver worker/README ou README.md
// principal). Configurável via VITE_AI_WORKER_URL para apontar a um worker
// próprio; sem essa variável, o botão "Gerar com IA" mostra um erro claro
// em vez de falhar silenciosamente.
const AI_WORKER_URL = import.meta.env.VITE_AI_WORKER_URL as string | undefined;

interface AIAgentContextArgs {
  products: Product[];
  coils: Coil[];
  orders: SlitterOrder[];
  kpis: PCPKPIs;
  history: CutHistoryItem[];
  ferramentais?: Ferramental[];
  intermediarySlitters?: SlitterIntermediaryItem[];
}

/**
 * Monta o "snapshot" de dados enviado ao agente de IA, reaproveitando o
 * mesmo motor determinístico (ReadinessService / SlitterOptimizer) já usado
 * no Painel Geral. A IA não recalcula cortes — ela prioriza, explica e
 * resume o que o motor de otimização já produziu.
 */
function buildContext({ products, coils, orders, kpis, history, ferramentais = [], intermediarySlitters = [] }: AIAgentContextArgs) {
  const programs = ReadinessService.generateSlitterPrograms(products, coils, intermediarySlitters).slice(0, 12);
  const demandItems = ReadinessService
    .sortSlittersByReadiness(ReadinessService.analyzeSlitters(products, coils, intermediarySlitters))
    .slice(0, 15);
  const toolingAnalysis = ReadinessService.analyzeToolingABC(ferramentais, products);
  const schedule3Days = ReadinessService.generate3DaySchedule(
    ReadinessService.generateSlitterPrograms(products, coils, intermediarySlitters),
    orders
  );

  const availableCoils = coils.filter(c => c.status === 'Disponível');

  const semCadastro = ReadinessService
    .analyzeSlitters(products, coils, intermediarySlitters)
    .filter(d => !d.ferramentalCadastrado && d.totalDemandaT > 0);

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
      codigoSlitter: d.codigoSlitter,
      ferramentalCadastrado: d.ferramentalCadastrado,
      larguraFita: d.larguraFita,
      espessura: d.espessura,
      demandaTotalTon: d.totalDemandaT,
      status: d.status,
      coveragePercent: d.coveragePercent,
      lotesCompativeis: d.compatibleLotCount
    })),
    ferramentalAbc: toolingAnalysis.slice(0, 25).map(t => ({
      codigo: t.ferramental.codigo,
      nome: t.ferramental.nome,
      classe: t.ferramental.classe,
      demandaAcumuladaT: t.demandaAcumuladaT,
      capacidadeMinimaT: t.ferramental.capacidadeMinimaT,
      statusAcumulo: t.statusAcumulo,
      prontaParaSetup: t.prontaParaSetup
    })),
    ferramentaisSemCadastro: semCadastro.slice(0, 15).map(d => ({
      slitter: d.nomeSlitter,
      larguraFita: d.larguraFita,
      espessura: d.espessura,
      demandaTotalTon: d.totalDemandaT
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
    limitacoesOperacionais: {
      horizonte3Dias: schedule3Days.days.map(d => ({
        dia: d.dataRotulo,
        volumeProgramadoTon: d.volumeProgramadoTon,
        quantidadeSetups: d.quantidadeSetups,
        toneladasPorSetup: d.toneladasPorSetup,
        alertaSetup: d.alertaSetup
      })),
      backlogVolumeTon: schedule3Days.backlog.volumeTon
    },
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
  static getStoredProvider(): AIProvider {
    try {
      const raw = localStorage.getItem(AI_PROVIDER_STORAGE_KEY);
      if (raw === 'anthropic' || raw === 'gemini' || raw === 'openai') return raw;
    } catch { /* localStorage indisponível */ }
    return 'anthropic';
  }

  static setStoredProvider(provider: AIProvider): void {
    try {
      localStorage.setItem(AI_PROVIDER_STORAGE_KEY, provider);
    } catch { /* localStorage indisponível */ }
  }

  static async run(mode: AIAgentMode, args: AIAgentContextArgs, provider?: AIProvider): Promise<AIAgentResult> {
    if (!AI_WORKER_URL) {
      throw new Error(
        'Agente de IA não configurado: defina VITE_AI_WORKER_URL no .env apontando para o Cloudflare Worker (ver worker/README.md).'
      );
    }

    const context = buildContext(args);
    const res = await fetch(AI_WORKER_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, context, provider: provider || this.getStoredProvider() })
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.message || 'Falha ao consultar o agente de IA.';
      throw new Error(message);
    }
    return data as AIAgentResult;
  }

  /** Encontra o programa de corte sugerido (para "Aplicar") a partir do id retornado pela IA. */
  static findProgramById(products: Product[], coils: Coil[], programId: string) {
    return ReadinessService.generateSlitterPrograms(products, coils).find(p => p.id === programId) || null;
  }
}
