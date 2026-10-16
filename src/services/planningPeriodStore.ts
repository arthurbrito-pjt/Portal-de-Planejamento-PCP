import { PeriodoData, PlanningScenarioService } from './planningScenarioService';

const KEY = 'pcp_periodo_planejamento_v1';

interface PeriodoSalvo extends PeriodoData {
  seguirHoje: boolean;
}

// Memória da sessão: o PlanningView é desmontado ao navegar para outras telas, mas o período que o
// operador escolheu deve continuar ao voltar. Fechar o navegador volta a abrir no dia de hoje.
let emMemoria: PeriodoSalvo | null = null;

export class PlanningPeriodStore {
  static carregar(): PeriodoData {
    const hoje = PlanningScenarioService.hojeIso();
    let salvo = emMemoria;
    if (!salvo) {
      try {
        const raw = sessionStorage.getItem(KEY);
        salvo = raw ? (JSON.parse(raw) as PeriodoSalvo) : null;
      } catch {
        salvo = null;
      }
    }
    if (!salvo || salvo.seguirHoje) return { inicio: hoje, fim: hoje };
    return { inicio: salvo.inicio, fim: salvo.fim };
  }

  static salvar(periodo: PeriodoData): void {
    const hoje = PlanningScenarioService.hojeIso();
    emMemoria = { ...periodo, seguirHoje: periodo.inicio === hoje && periodo.fim === hoje };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(emMemoria));
    } catch {
      // sem sessionStorage: segue só em memória
    }
  }
}
