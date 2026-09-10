import React, { useState } from 'react';
import {
  Sparkles,
  ListChecks,
  ShieldAlert,
  FileText,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  AlertTriangle,
  AlertCircle,
  Info,
  Bot
} from 'lucide-react';
import {
  Product,
  Coil,
  SlitterOrder,
  PCPKPIs,
  CutHistoryItem,
  AIAgentResult,
  AIInsight,
  AIRecommendation
} from '../types/pcp';
import { AIAgentService, AIAgentMode } from '../services/aiAgentService';
import { SlitterProductionProgram } from '../services/readinessService';

interface AIAgentViewProps {
  products: Product[];
  coils: Coil[];
  orders: SlitterOrder[];
  kpis: PCPKPIs;
  history: CutHistoryItem[];
  onOpenProgramSimulation: (program: SlitterProductionProgram) => void;
  onOpenProgramOrder: (program: SlitterProductionProgram) => void;
  onNavigateToDashboard: () => void;
}

type SectionKey = 'recommendations' | 'alerts' | 'summary';

const SECTIONS: { key: SectionKey; mode: AIAgentMode; title: string; description: string; icon: React.ElementType }[] = [
  {
    key: 'recommendations',
    mode: 'recommendations',
    title: 'Recomendações de Corte',
    description: 'A IA analisa estoque, demanda e os programas já calculados pelo motor de otimização e sugere a ordem de execução.',
    icon: ListChecks
  },
  {
    key: 'alerts',
    mode: 'alerts',
    title: 'Alertas Proativos',
    description: 'Riscos de ruptura de estoque, baixa eficiência e sobras fora da faixa ideal, identificados automaticamente.',
    icon: ShieldAlert
  },
  {
    key: 'summary',
    mode: 'summary',
    title: 'Resumo Executivo',
    description: 'Um resumo em linguagem natural da situação atual da produção, pronto para compartilhar com a gestão.',
    icon: FileText
  }
];

const severityStyles: Record<string, { bg: string; icon: React.ElementType }> = {
  critico: { bg: 'bg-red-50 text-red-800 border-red-300', icon: AlertCircle },
  atencao: { bg: 'bg-amber-50 text-amber-800 border-amber-300', icon: AlertTriangle },
  info: { bg: 'bg-blue-50 text-blue-800 border-blue-300', icon: Info }
};

const priorityStyles: Record<string, string> = {
  ALTA: 'bg-red-50 text-red-800 border-red-300',
  MEDIA: 'bg-amber-50 text-amber-800 border-amber-300',
  BAIXA: 'bg-slate-100 text-slate-600 border-slate-300'
};

export const AIAgentView: React.FC<AIAgentViewProps> = ({
  products,
  coils,
  orders,
  kpis,
  history,
  onOpenProgramSimulation,
  onOpenProgramOrder,
  onNavigateToDashboard
}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('recommendations');
  const [results, setResults] = useState<Partial<Record<SectionKey, AIAgentResult>>>({});
  const [loading, setLoading] = useState<Partial<Record<SectionKey, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<SectionKey, string>>>({});

  const activeSectionInfo = SECTIONS.find(s => s.key === activeSection)!;

  const runAgent = async (section: SectionKey, mode: AIAgentMode) => {
    setLoading(prev => ({ ...prev, [section]: true }));
    setErrors(prev => ({ ...prev, [section]: undefined }));
    try {
      const result = await AIAgentService.run(mode, { products, coils, orders, kpis, history });
      setResults(prev => ({ ...prev, [section]: result }));
    } catch (err: any) {
      const message = err?.message || 'Não foi possível consultar o agente de IA. Verifique se a Cloud Function está publicada.';
      setErrors(prev => ({ ...prev, [section]: message }));
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleApply = (programId: string | undefined, target: 'simulation' | 'order') => {
    if (!programId) return;
    const program = AIAgentService.findProgramById(products, coils, programId);
    if (!program) return;
    if (target === 'simulation') onOpenProgramSimulation(program);
    else onOpenProgramOrder(program);
  };

  const isLoading = !!loading[activeSection];
  const error = errors[activeSection];
  const result = results[activeSection];
  const hasContent = !!result && (result.resumo || (result.insights && result.insights.length > 0) || (result.recomendacoes && result.recomendacoes.length > 0));

  return (
    <div className="space-y-4 pb-16 animate-fadeIn w-full">
      {/* Header */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Agente de IA do PCP
            </h2>
            <p className="text-sm text-slate-500">
              Usa Claude (Anthropic) sobre os dados já calculados pelo motor de otimização para priorizar, alertar e resumir — sem substituir a regra de refilo de 10 a 18 mm.
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateToDashboard}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          Voltar ao Painel Geral
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.key;
          return (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.title}
            </button>
          );
        })}
      </div>

      {/* Active Section Panel */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-2xl space-y-0.5">
            <h3 className="text-base font-semibold text-slate-900">{activeSectionInfo.title}</h3>
            <p className="text-sm text-slate-500">{activeSectionInfo.description}</p>
          </div>
          <button
            onClick={() => runAgent(activeSection, activeSectionInfo.mode)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium shadow-sm transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : hasContent ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isLoading ? 'Consultando IA...' : hasContent ? 'Gerar novamente' : 'Gerar com IA'}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!error && !hasContent && !isLoading && (
          <div className="p-8 rounded-lg border border-dashed border-slate-300 text-center text-sm text-slate-400">
            Clique em "Gerar com IA" para analisar os dados atuais do portal.
          </div>
        )}

        {result?.resumo && (
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-sm text-indigo-900 leading-relaxed">
            {result.resumo}
          </div>
        )}

        {activeSection === 'recommendations' && result?.recomendacoes && result.recomendacoes.length > 0 && (
          <div className="space-y-3">
            {result.recomendacoes.map((rec: AIRecommendation, idx: number) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">{rec.titulo}</h4>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold shrink-0 ${priorityStyles[rec.prioridade] || priorityStyles.BAIXA}`}>
                    Prioridade {rec.prioridade}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{rec.justificativa}</p>
                {rec.impactoEstimado && (
                  <p className="text-xs font-medium text-slate-500">Impacto estimado: {rec.impactoEstimado}</p>
                )}
                {rec.programId && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApply(rec.programId, 'simulation')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:border-blue-400 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors"
                    >
                      Ver no Estúdio de Corte <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleApply(rec.programId, 'order')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                    >
                      Abrir Ordem de Produção <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {(activeSection === 'alerts' || activeSection === 'summary') && result?.insights && result.insights.length > 0 && (
          <div className="space-y-3">
            {result.insights.map((insight: AIInsight, idx: number) => {
              const style = severityStyles[insight.severidade] || severityStyles.info;
              const Icon = style.icon;
              return (
                <div key={idx} className={`p-4 rounded-lg border ${style.bg.replace('text-', 'border-').split(' ')[0]} bg-slate-50 border-slate-200 space-y-2`}>
                  <div className="flex items-start gap-2.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border shrink-0 ${style.bg}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">{insight.titulo}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 font-mono">
                          {insight.categoria}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{insight.descricao}</p>
                      {insight.acaoSugerida && (
                        <p className="text-xs font-medium text-slate-500">Ação sugerida: {insight.acaoSugerida}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
