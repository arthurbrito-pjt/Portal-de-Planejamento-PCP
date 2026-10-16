import { Coil, Product, SlitterCombination, SlitterIntermediaryItem } from '../types/pcp';
import { SlitterOptimizer } from './slitterOptimizer';
import { RefiloService, RefiloLados } from './refiloService';
import { OrderCoilInput } from './orderBuilderService';
import { SlitterCatalogService } from './slitterCatalogService';
import { FerramentalConformacaoService } from './ferramentalConformacaoService';

/**
 * Motor de cenários de planejamento (Visão A/B x Produção mesclada/separada).
 * Reaproveita o SlitterOptimizer (combinações de corte e regra de refilo) e as
 * regras do OpPlannerService (demanda manda, WIP abatido primeiro, produção acima
 * da demanda só com autorização). A diferença está em COMO cada bobina é escolhida:
 *  - Visão A: maior aproveitamento real da bobina (aceita mais trocas de facas);
 *  - Visão B: menos setups/trocas de facas, sem perder mais que YIELD_TOL_B_PP de aproveitamento.
 * A demanda é consumida por data do Excel de Programação (mais antiga primeiro).
 */

export type VisaoOtimizacao = 'A' | 'B';
export type CenarioProducao = 'MESCLADA' | 'SEPARADA';
export interface PeriodoData {
  inicio: string; // yyyy-mm-dd; '' = sem limite inferior
  fim: string; // yyyy-mm-dd; '' = sem limite superior
}

export const MIN_BOBINAS_PLANEJAMENTO = 3;
const YIELD_TOL_B_PP = 2;
const YIELD_TIE_PP = 0.15;
const TOL_T = 0.05;
const MAX_FORMAS = 14;
const MAX_BOBINAS_BLOCO = 60;
const SEM_DATA = '';

const dataKey = (d: string) => (d === SEM_DATA ? '9999-99-99' : d);
const round = (n: number, d = 2) => Number(n.toFixed(d));

export interface CenarioParams {
  foco: Product[]; // materiais do escopo (demanda a atender)
  complementos: Product[]; // outros itens da mesma espessura que podem completar a bobina (só na produção mesclada)
  coils: Coil[];
  intermediary?: SlitterIntermediaryItem[];
  ateData?: string | null; // horizonte: só entra a demanda com data <= ateData (sem data sempre entra)
  permitirExcedente?: boolean; // permite corte que passa da demanda (exige autorização na OP)
}

export interface EscopoGrupo {
  codigo: string; // código do slitter ou do ferramental
  nome: string;
  produtos: Product[]; // materiais com demanda dentro do horizonte
  demandaT: number;
}

export interface DetalheFerramental {
  maquina: string;
  materiais: { product: Product; demandaT: number }[]; // todos os itens que o ferramental produz (com ou sem demanda)
  slitters: { codigo: string; nome: string; larguraFita: number; espessura: number; cadastrado: boolean; materiais: Product[] }[];
  bobinas: { espessura: number; qtd: number; pesoT: number; larguras: number[] }[];
  semBobina: number[]; // espessuras com demanda e nenhuma bobina em estoque
}

export interface CoberturaEspessura {
  espessura: number;
  demandaT: number; // demanda a cortar (já sem o estoque de slitter)
  qtdBobinas: number;
  estoqueT: number; // bobinas disponíveis dessa espessura
  atendidoT: number; // atendido por este cenário
  faltaMpT: number; // demanda que nem todo o estoque de bobinas cobre
  limiteCorteT: number; // pendente mesmo havendo bobina (precisa produzir acima da demanda ou não fecha refilo)
}

export interface PlanoBobina {
  ordem: number;
  coil: Coil;
  combination: SlitterCombination;
  refilo: RefiloLados;
  setup: number; // nº da configuração de facas (1, 2, ...)
  setupSig: string;
  trocasAntes: number; // facas movimentadas em relação ao corte anterior (0 no primeiro)
  trocaDetalhe: string; // o que montar/retirar em relação ao corte anterior ('' = mesma configuração)
  dataFoco: string; // data de programação que motivou este corte ('' = sem data)
  producaoT: number;
  perdaT: number;
  excedeDemanda: boolean;
}

export interface LinhaDemanda {
  product: Product;
  data: string;
  demandaT: number;
  wipT: number;
  planejadoT: number;
  atendidoT: number;
  saldoT: number;
}

export interface ProdutoAtendimento {
  product: Product;
  noEscopo: boolean;
  demandaT: number;
  wipT: number;
  producaoT: number; // peso total das fitas deste item no plano
  atendidoT: number;
  atendidoPercent: number;
  saldoT: number;
  excedenteT: number;
  motivoSaldo?: string;
}

export interface MetricasCenario {
  qtdBobinas: number;
  pesoBobinasT: number;
  producaoT: number;
  perdasT: number;
  aproveitamentoPercent: number;
  refiloMedioMm: number;
  refiloMinMm: number;
  refiloMaxMm: number;
  refiloEsqMedioMm: number;
  refiloDirMedioMm: number;
  setups: number;
  trocasFacas: number;
  demandaT: number;
  atendidoT: number;
  atendimentoPercent: number;
  saldoT: number;
  excedenteT: number;
}

export interface ResultadoCenario {
  visao: VisaoOtimizacao;
  cenario: CenarioProducao;
  planos: PlanoBobina[];
  linhas: LinhaDemanda[];
  produtos: ProdutoAtendimento[];
  metricas: MetricasCenario;
  minBobinas: { requerido: number; atendido: boolean; motivo?: string };
  restricoes: string[];
  bobinasCompativeis: number;
  equivalenteA?: CenarioProducao; // quando mesclada e separada resultaram no mesmo plano
  nota?: string;
}

interface Linha {
  product: Product;
  data: string;
  demandaT: number;
  restanteT: number;
  wipT: number;
  planejadoT: number;
}

interface Candidato {
  coil: Coil;
  combo: SlitterCombination;
  focusCoveredT: number;
  coveredT: number;
  producedByProduct: Map<string, number>;
  sig: string;
  reaproveita: boolean;
}

interface RawPlano {
  coil: Coil;
  combo: SlitterCombination;
  dataFoco: string;
  sig: string;
}

interface BlocoCtx {
  espessura: number;
  foco: Product[];
  comps: Product[];
  coils: Coil[];
  linhasBase: Linha[];
}

interface BlocoResultado {
  planos: RawPlano[];
  linhas: Linha[];
  bloqueios: Map<string, string>;
  coilsLivres: number;
  producaoPorProduto: Map<string, number>;
}

type CacheOtimizador = Map<string, SlitterCombination[]>;

export class PlanningScenarioService {
  // ---------------------------------------------------------------------------
  // Demanda por data (Excel de Programação)
  // ---------------------------------------------------------------------------

  /** Demanda do produto aberta por data; sem data na planilha vira uma única linha "sem data". */
  static demandaDoProduto(p: Product, ateData?: string | null): { data: string; qtdT: number }[] {
    const base = p.demandaPorData && p.demandaPorData.length > 0
      ? p.demandaPorData.map(d => ({ data: d.data, qtdT: d.qtdT }))
      : (p.demandaT || 0) > 0 ? [{ data: SEM_DATA, qtdT: p.demandaT || 0 }] : [];
    return base
      .filter(d => d.qtdT > 0 && (!ateData || d.data === SEM_DATA || d.data <= ateData))
      .sort((a, b) => dataKey(a.data).localeCompare(dataKey(b.data)));
  }

  static dataIso(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  static hojeIso(): string {
    return this.dataIso(new Date());
  }

  /** Demanda por data somada (t), em ordem de data; itens sem data não entram. */
  static resumoDatas(products: Product[]): { data: string; qtdT: number }[] {
    const mapa = new Map<string, number>();
    products.forEach(p => (p.demandaPorData || []).forEach(d => { if (d.data && d.qtdT > 0) mapa.set(d.data, (mapa.get(d.data) ?? 0) + d.qtdT); }));
    return Array.from(mapa.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([data, qtdT]) => ({ data, qtdT: round(qtdT, 2) }));
  }

  /**
   * Recorta a demanda pelo período de planejamento (de ... até ..., qualquer um dos lados pode ficar
   * em aberto). Itens sem data (pedidos fora da programação) só entram quando o período está
   * totalmente em aberto, pois não há dia de produção definido para eles.
   */
  static filtrarPorPeriodo(products: Product[], periodo: PeriodoData): Product[] {
    const { inicio, fim } = periodo;
    if (!inicio && !fim) return products;
    return products.map(p => {
      if (!p.demandaPorData || p.demandaPorData.length === 0) return { ...p, demandaT: 0 };
      const entradas = p.demandaPorData.filter(e => !e.data || ((!inicio || e.data >= inicio) && (!fim || e.data <= fim)));
      const total = round(entradas.reduce((a, e) => a + e.qtdT, 0), 3);
      const { demandaPorData: _antiga, ...resto } = p;
      return { ...resto, demandaT: total, ...(entradas.length > 0 ? { demandaPorData: entradas } : {}) };
    });
  }

  static datasDeProgramacao(products: Product[]): string[] {
    const set = new Set<string>();
    products.forEach(p => (p.demandaPorData || []).forEach(d => { if (d.qtdT > 0) set.add(d.data); }));
    return Array.from(set).sort();
  }

  static formatData(data: string): string {
    if (!data) return 'Sem data';
    const [y, m, d] = data.split('-');
    return `${d}/${m}/${y}`;
  }

  /** Configuração de facas: largura x quantidade (independe do produto). */
  private static assinatura(combo: SlitterCombination): { sig: string; mapa: Map<number, number> } {
    const mapa = new Map<number, number>();
    combo.fitas.forEach(f => mapa.set(f.product.larguraFita, (mapa.get(f.product.larguraFita) ?? 0) + f.quantidade));
    const sig = Array.from(mapa.entries()).sort((a, b) => b[0] - a[0]).map(([w, n]) => `${w}x${n}`).join('|');
    return { sig, mapa };
  }

  private static facasMovidas(anterior: Map<number, number> | null, novo: Map<number, number>): number {
    if (!anterior) return 0;
    let moved = 0;
    novo.forEach((n, w) => { moved += Math.max(0, n - (anterior.get(w) ?? 0)); });
    return moved;
  }

  // ---------------------------------------------------------------------------
  // Escopos: por slitter (largura de fita) e por ferramental de conformação — mesmo motor nos dois
  // ---------------------------------------------------------------------------

  private static comDemanda(products: Product[], ateData?: string | null): Product[] {
    return products.filter(p => this.demandaDoProduto(p, ateData).length > 0);
  }

  private static somaDemanda(products: Product[], ateData?: string | null): number {
    return round(products.reduce((a, p) => a + this.demandaDoProduto(p, ateData).reduce((x, d) => x + d.qtdT, 0), 0), 2);
  }

  static agruparPorSlitter(products: Product[], ateData?: string | null): EscopoGrupo[] {
    const mapa = new Map<string, EscopoGrupo>();
    this.comDemanda(products, ateData).forEach(p => {
      const info = SlitterCatalogService.getSlitterInfo(p.larguraFita, p.espessura, p);
      const codigo = info.cadastrado ? info.code : `DIM_${p.larguraFita}_${p.espessura}`;
      const nome = info.cadastrado ? info.name : `Sem ferramental cadastrado (${p.larguraFita} mm x ${p.espessura} mm)`;
      const g = mapa.get(codigo) ?? { codigo, nome, produtos: [], demandaT: 0 };
      g.produtos.push(p);
      mapa.set(codigo, g);
    });
    return Array.from(mapa.values()).map(g => ({ ...g, demandaT: this.somaDemanda(g.produtos, ateData) })).sort((a, b) => b.demandaT - a.demandaT);
  }

  static agruparPorFerramental(products: Product[], ateData?: string | null): EscopoGrupo[] {
    const mapa = new Map<string, EscopoGrupo>();
    this.comDemanda(products, ateData).forEach(p => {
      const f = FerramentalConformacaoService.resolve(p);
      const codigo = f?.codigo ?? 'SEM_FERRAMENTAL';
      const g = mapa.get(codigo) ?? { codigo, nome: f?.nome ?? 'Sem ferramental mapeado (informação ausente)', produtos: [], demandaT: 0 };
      g.produtos.push(p);
      mapa.set(codigo, g);
    });
    return Array.from(mapa.values()).map(g => ({ ...g, demandaT: this.somaDemanda(g.produtos, ateData) })).sort((a, b) => b.demandaT - a.demandaT);
  }

  /** Complementos = demais itens com demanda das mesmas espessuras do escopo. */
  static paramsDoEscopo(
    foco: Product[],
    todos: Product[],
    coils: Coil[],
    opts: { intermediary?: SlitterIntermediaryItem[]; ateData?: string | null; completar: boolean; permitirExcedente: boolean }
  ): CenarioParams {
    const ids = new Set(foco.map(p => p.id));
    const espessuras = foco.map(p => p.espessura);
    const complementos = opts.completar
      ? this.comDemanda(todos, opts.ateData).filter(p => !ids.has(p.id) && espessuras.some(e => Math.abs(e - p.espessura) < 0.001))
      : [];
    return { foco, complementos, coils, intermediary: opts.intermediary, ateData: opts.ateData, permitirExcedente: opts.permitirExcedente };
  }

  static detalharFerramental(codigo: string, todos: Product[], coils: Coil[], ateData?: string | null): DetalheFerramental {
    const itens = todos.filter(p => (FerramentalConformacaoService.resolve(p)?.codigo ?? 'SEM_FERRAMENTAL') === codigo);
    const maquina = itens.length > 0 ? FerramentalConformacaoService.maquina(itens[0]) : '—';
    const materiais = itens
      .map(p => ({ product: p, demandaT: round(this.demandaDoProduto(p, ateData).reduce((a, d) => a + d.qtdT, 0), 2) }))
      .sort((a, b) => b.demandaT - a.demandaT || a.product.codigo.localeCompare(b.product.codigo));

    const slitters = new Map<string, DetalheFerramental['slitters'][number]>();
    itens.forEach(p => {
      const info = SlitterCatalogService.getSlitterInfo(p.larguraFita, p.espessura, p);
      const k = info.cadastrado ? info.code : `DIM_${p.larguraFita}_${p.espessura}`;
      const atual = slitters.get(k) ?? { codigo: info.cadastrado ? info.code : 'SEM-CADASTRO', nome: info.name, larguraFita: p.larguraFita, espessura: p.espessura, cadastrado: info.cadastrado, materiais: [] };
      atual.materiais.push(p);
      slitters.set(k, atual);
    });

    const disponiveis = coils.filter(c => c.status === 'Disponível');
    const espessuras = Array.from(new Set(itens.map(p => round(p.espessura, 3)))).sort((a, b) => a - b);
    const bobinas = espessuras
      .map(e => {
        const cs = disponiveis.filter(c => Math.abs(c.espessura - e) < 0.001);
        return { espessura: e, qtd: cs.length, pesoT: round(cs.reduce((a, c) => a + c.peso, 0), 2), larguras: Array.from(new Set(cs.map(c => c.largura))).sort((a, b) => a - b) };
      });
    const comDem = new Set(this.comDemanda(itens, ateData).map(p => round(p.espessura, 3)));
    return {
      maquina,
      materiais,
      slitters: Array.from(slitters.values()).sort((a, b) => a.larguraFita - b.larguraFita),
      bobinas,
      semBobina: bobinas.filter(b => b.qtd === 0 && comDem.has(b.espessura)).map(b => b.espessura)
    };
  }

  // ---------------------------------------------------------------------------
  // Execução de um cenário
  // ---------------------------------------------------------------------------

  static executar(params: CenarioParams, visao: VisaoOtimizacao, cenario: CenarioProducao, cache: CacheOtimizador = new Map()): ResultadoCenario {
    const focoComDemanda = params.foco.filter(p => this.demandaDoProduto(p, params.ateData).length > 0);
    const idsFoco = new Set(focoComDemanda.map(p => p.id));
    const complementos = params.complementos.filter(p => !idsFoco.has(p.id) && this.demandaDoProduto(p, params.ateData).length > 0);
    const disponiveis = params.coils.filter(c => c.status === 'Disponível');

    const espessuras = Array.from(new Set(focoComDemanda.map(p => round(p.espessura, 3)))).sort((a, b) => a - b);
    const blocos: BlocoCtx[] = espessuras.map(espessura => {
      const foco = focoComDemanda.filter(p => Math.abs(p.espessura - espessura) < 0.001);
      const comps = complementos.filter(p => Math.abs(p.espessura - espessura) < 0.001);
      return {
        espessura,
        foco,
        comps,
        coils: disponiveis.filter(c => Math.abs(c.espessura - espessura) < 0.001),
        linhasBase: this.montarLinhas([...foco, ...comps], params.intermediary ?? [], params.ateData)
      };
    });

    const rodar = (modo: 'normal' | 'dividir', minPorBloco: number[]) =>
      blocos.map((b, i) => this.planejarBloco(b, visao, cenario, !!params.permitirExcedente, modo, minPorBloco[i], cache));

    let resultados = rodar('normal', blocos.map(() => 0));
    const totalCoils = () => resultados.reduce((a, r) => a + r.planos.length, 0);
    const bobinasCompativeis = blocos.reduce((a, b) => a + b.coils.length, 0);

    // Regra padrão: mínimo de 3 bobinas. Antes de desistir, tenta dividir a demanda em bobinas
    // menores — só vale se atende a mesma demanda, sem excesso novo.
    if (totalCoils() < MIN_BOBINAS_PLANEJAMENTO && bobinasCompativeis >= MIN_BOBINAS_PLANEJAMENTO && blocos.length > 0) {
      const ordem = blocos.map((b, i) => ({ i, dem: b.linhasBase.filter(l => idsFoco.has(l.product.id)).reduce((a, l) => a + l.demandaT, 0) })).sort((a, b) => b.dem - a.dem);
      for (const { i } of ordem) {
        if (totalCoils() >= MIN_BOBINAS_PLANEJAMENTO) break;
        const outros = totalCoils() - resultados[i].planos.length;
        const minBloco = Math.max(1, MIN_BOBINAS_PLANEJAMENTO - outros);
        const alternativa = this.planejarBloco(blocos[i], visao, cenario, !!params.permitirExcedente, 'dividir', minBloco, cache);
        const cobertura = (r: BlocoResultado) => r.linhas.reduce((a, l) => a + (l.demandaT - l.restanteT), 0);
        const excesso = (r: BlocoResultado) => this.excessoDoBloco(r);
        if (
          alternativa.planos.length > resultados[i].planos.length &&
          cobertura(alternativa) >= cobertura(resultados[i]) - TOL_T &&
          excesso(alternativa) <= excesso(resultados[i]) + TOL_T
        ) {
          resultados = resultados.map((r, k) => (k === i ? alternativa : r));
        }
      }
    }

    return this.montarResultado(visao, cenario, blocos, resultados, idsFoco, bobinasCompativeis);
  }

  /** Mesclada x separada, Visão A x B: os 4 cenários com o mesmo cache de otimização. */
  static compararTodos(params: CenarioParams): ResultadoCenario[] {
    const cache: CacheOtimizador = new Map();
    const out: ResultadoCenario[] = [];
    (['A', 'B'] as VisaoOtimizacao[]).forEach(v => (['MESCLADA', 'SEPARADA'] as CenarioProducao[]).forEach(c => out.push(this.executar(params, v, c, cache))));
    // A Visão A também é candidata da Visão B: se ela já tem menos trocas/setups com o mesmo atendimento,
    // o plano de menos trocas é o dela (a busca gulosa da B pode terminar pior que a A).
    (['MESCLADA', 'SEPARADA'] as CenarioProducao[]).forEach(c => {
      const ia = out.findIndex(r => r.visao === 'A' && r.cenario === c);
      const ib = out.findIndex(r => r.visao === 'B' && r.cenario === c);
      const a = out[ia];
      const b = out[ib];
      if (a.planos.length > 0 && a.metricas.atendimentoPercent >= b.metricas.atendimentoPercent - 1) {
        const reB = this.resequenciar(a, 'B');
        const melhor = reB.metricas.trocasFacas < b.metricas.trocasFacas || (reB.metricas.trocasFacas === b.metricas.trocasFacas && reB.metricas.setups < b.metricas.setups);
        if (melhor) {
          out[ib] = { ...reB, nota: 'As bobinas do plano de maior aproveitamento (Visão A), na sequência de menos trocas, já são o melhor plano de menos trocas de facas para este escopo.' };
        }
      }
    });
    // Mesclada e separada são o mesmo plano quando só há um material e nenhum complemento.
    (['A', 'B'] as VisaoOtimizacao[]).forEach(v => {
      const m = out.find(r => r.visao === v && r.cenario === 'MESCLADA')!;
      const s = out.find(r => r.visao === v && r.cenario === 'SEPARADA')!;
      const assin = (r: ResultadoCenario) => r.planos.map(p => `${p.coil.id}:${p.setupSig}`).join(',');
      if (assin(m) === assin(s)) { s.equivalenteA = 'MESCLADA'; }
    });
    return out;
  }

  private static montarLinhas(produtos: Product[], intermediary: SlitterIntermediaryItem[], ateData?: string | null): Linha[] {
    const linhas: Linha[] = [];
    produtos.forEach(p => this.demandaDoProduto(p, ateData).forEach(d => linhas.push({
      product: p, data: d.data, demandaT: d.qtdT, restanteT: d.qtdT, wipT: 0, planejadoT: 0
    })));
    linhas.sort((a, b) => dataKey(a.data).localeCompare(dataKey(b.data)) || b.demandaT - a.demandaT);

    // Estoque de slitter (fitas já cortadas) abate a demanda antes de cortar bobina nova.
    const wipPorChave = new Map<string, number>();
    intermediary.forEach(it => {
      const k = `${it.larguraFita}|${round(it.espessura, 3)}`;
      wipPorChave.set(k, (wipPorChave.get(k) ?? 0) + it.pesoDisponivelTon);
    });
    wipPorChave.forEach((wip, k) => {
      let sobra = wip;
      linhas
        .filter(l => `${l.product.larguraFita}|${round(l.product.espessura, 3)}` === k)
        .forEach(l => {
          const usa = Math.min(sobra, l.restanteT);
          l.wipT = round(usa, 3);
          l.restanteT = round(l.restanteT - usa, 3);
          sobra -= usa;
        });
    });
    return linhas;
  }

  private static excessoDoBloco(r: BlocoResultado): number {
    let total = 0;
    r.producaoPorProduto.forEach((prod, id) => {
      const planejado = r.linhas.filter(l => l.product.id === id).reduce((a, l) => a + l.planejadoT, 0);
      total += Math.max(0, prod - planejado);
    });
    return total;
  }

  // ---------------------------------------------------------------------------
  // Planejamento de uma espessura
  // ---------------------------------------------------------------------------

  private static planejarBloco(
    ctx: BlocoCtx,
    visao: VisaoOtimizacao,
    cenario: CenarioProducao,
    permitirExcedente: boolean,
    modo: 'normal' | 'dividir',
    minBobinas: number,
    cache: CacheOtimizador
  ): BlocoResultado {
    const linhas: Linha[] = ctx.linhasBase.map(l => ({ ...l }));
    const produtos = new Map<string, Product>();
    [...ctx.foco, ...ctx.comps].forEach(p => produtos.set(p.id, p));
    const usadas = new Set<string>();
    const planos: RawPlano[] = [];
    const bloqueios = new Map<string, string>();
    const producaoPorProduto = new Map<string, number>();
    const setupsEscolhidos = new Map<string, { fitas: { product: Product; quantidade: number }[]; mapa: Map<number, number> }>();
    let ultimoMapa: Map<number, number> | null = null;

    const restante = (id: string) => linhas.filter(l => l.product.id === id).reduce((a, l) => a + l.restanteT, 0);
    const primeiraData = (id: string) => linhas.find(l => l.product.id === id && l.restanteT > TOL_T)?.data ?? SEM_DATA;
    const consumir = (id: string, t: number) => {
      let falta = t;
      for (const l of linhas) {
        if (l.product.id !== id || l.restanteT <= 0 || falta <= 0) continue;
        const usa = Math.min(l.restanteT, falta);
        l.restanteT = round(l.restanteT - usa, 4);
        l.planejadoT = round(l.planejadoT + usa, 4);
        falta -= usa;
      }
    };

    const formas = (): Coil[] => {
      const livres = ctx.coils.filter(c => !usadas.has(c.id));
      const porForma = new Map<string, Coil[]>();
      livres.forEach(c => {
        const k = `${c.largura}|${round(c.peso, 2)}`;
        porForma.set(k, [...(porForma.get(k) ?? []), c]);
      });
      const reps = Array.from(porForma.values()).map(l => l[0]);
      const escolhidas: Coil[] = [];
      const add = (c: Coil) => { if (escolhidas.length < MAX_FORMAS && !escolhidas.includes(c)) escolhidas.push(c); };
      const porLargura = new Map<number, Coil>();
      [...reps].sort((a, b) => b.peso - a.peso).forEach(c => { if (!porLargura.has(c.largura)) porLargura.set(c.largura, c); });
      Array.from(porLargura.values()).slice(0, 8).forEach(add);
      [...reps].sort((a, b) => a.peso - b.peso).slice(0, 3).forEach(add);
      [...reps].sort((a, b) => b.peso - a.peso).forEach(add);
      return escolhidas;
    };

    const servir = (idsFoco: string[], compatDe: (main: Product) => Product[]) => {
      for (let guard = 0; guard < MAX_BOBINAS_BLOCO; guard++) {
        const ativos = idsFoco.filter(id => restante(id) > TOL_T && !bloqueios.has(id));
        if (ativos.length === 0) return;
        const livres = ctx.coils.filter(c => !usadas.has(c.id));
        if (livres.length === 0) {
          ativos.forEach(id => bloqueios.set(id, 'Bobinas compatíveis esgotadas'));
          return;
        }

        const proxData = ativos.map(primeiraData).sort((a, b) => dataKey(a).localeCompare(dataKey(b)))[0];
        const focoAtual = ativos.filter(id => primeiraData(id) === proxData);
        const main = produtos.get([...focoAtual].sort((a, b) => restante(b) - restante(a))[0])!;
        const grupo = cenario === 'SEPARADA'
          ? [main.id]
          : focoAtual.filter(id => produtos.get(id)!.larguraFita === main.larguraFita);
        const compat = compatDe(main).filter(p => restante(p.id) > TOL_T || p.id === main.id);
        const demandaMap = new Map<string, number>();
        compat.forEach(p => demandaMap.set(p.id, restante(p.id)));
        const focoSet = new Set(focoAtual);
        const focoRestante = focoAtual.reduce((a, id) => a + restante(id), 0);

        const candidatos: Candidato[] = [];
        const demandaSig = compat.map(p => `${p.id}:${round(restante(p.id), 1)}`).join(',');
        for (const coil of formas()) {
          const key = `${coil.largura}|${round(coil.peso, 2)}|${main.id}|${grupo.join('+')}|${demandaSig}`;
          let combos = cache.get(key);
          if (!combos) {
            combos = SlitterOptimizer.optimize({
              mainProduct: main,
              desiredQuantityTon: grupo.reduce((a, id) => a + restante(id), 0),
              selectedCoil: coil,
              compatibleProducts: compat,
              minScrapMm: 12,
              maxScrapAllowedMm: 18,
              demandSplitGroup: grupo.length > 1 ? grupo.map(id => ({ product: produtos.get(id)!, demandaT: restante(id) })) : undefined,
              demandaPorProduto: Object.fromEntries(demandaMap)
            });
            cache.set(key, combos);
          }
          const todos: { combo: SlitterCombination; reaproveita: boolean }[] = combos.map(c => ({ combo: c, reaproveita: false }));

          // Visão B: tenta repetir configurações de facas já montadas nesta bobina.
          if (visao === 'B') {
            setupsEscolhidos.forEach(s => {
              const usado = s.fitas.reduce((a, f) => a + f.quantidade * f.product.larguraFita, 0);
              if (usado > coil.largura || !RefiloService.isValido(coil.largura - usado)) return;
              if (s.fitas.some(f => Math.abs(f.product.espessura - coil.espessura) > 0.001)) return;
              const combo = SlitterOptimizer.evaluate(
                coil,
                s.fitas.map(f => ({ product: f.product, quantidade: f.quantidade, larguraTotal: f.quantidade * f.product.larguraFita })),
                'Repete a configuração de facas já montada',
                demandaMap,
                focoSet
              );
              todos.push({ combo, reaproveita: true });
            });
          }

          for (const { combo, reaproveita } of todos) {
            if (!combo.refiloValido) continue;
            const cov = SlitterOptimizer.computeCoverage(combo, coil, demandaMap, focoSet);
            if (cov.focusCoveredT <= TOL_T) continue;
            candidatos.push({
              coil, combo, focusCoveredT: cov.focusCoveredT, coveredT: cov.coveredT,
              producedByProduct: cov.producedByProduct, sig: this.assinatura(combo).sig, reaproveita
            });
          }
        }

        const semExcesso = candidatos.filter(c => !c.combo.excedeDemanda);
        const comExcesso = candidatos.filter(c => c.combo.excedeDemanda);
        let escolhido: Candidato | undefined;
        if (semExcesso.length > 0) {
          escolhido = this.escolher(semExcesso, visao, modo, minBobinas - planos.length, focoRestante, ultimoMapa, livres);
        } else if (permitirExcedente && comExcesso.length > 0) {
          escolhido = [...comExcesso].sort((a, b) =>
            (a.combo.excedenteT ?? 0) - (b.combo.excedenteT ?? 0) || b.focusCoveredT - a.focusCoveredT || b.combo.aproveitamentoPercent - a.combo.aproveitamentoPercent
          )[0];
        }

        if (!escolhido) {
          const motivo = comExcesso.length > 0
            ? 'Saldo menor que o mínimo produzível sem passar da demanda (produzir exigiria autorização de excedente)'
            : 'Sem combinação de corte com refilo válido (6–9 mm por lado, 12–18 mm no total) para este item';
          grupo.forEach(id => bloqueios.set(id, motivo));
          continue;
        }

        usadas.add(escolhido.coil.id);
        const { sig, mapa } = this.assinatura(escolhido.combo);
        planos.push({ coil: escolhido.coil, combo: escolhido.combo, dataFoco: proxData, sig });
        if (!setupsEscolhidos.has(sig)) {
          setupsEscolhidos.set(sig, { fitas: escolhido.combo.fitas.map(f => ({ product: f.product, quantidade: f.quantidade })), mapa });
        }
        ultimoMapa = mapa;
        const largPorProduto = new Map<string, number>();
        escolhido.combo.fitas.forEach(f => largPorProduto.set(f.product.id, (largPorProduto.get(f.product.id) ?? 0) + f.larguraTotal));
        largPorProduto.forEach((larg, id) => {
          const peso = escolhido!.coil.peso * (larg / escolhido!.coil.largura);
          producaoPorProduto.set(id, (producaoPorProduto.get(id) ?? 0) + peso);
          if (produtos.has(id)) consumir(id, peso);
        });
      }
    };

    const idsFoco = ctx.foco.map(p => p.id);
    if (cenario === 'MESCLADA') {
      servir(idsFoco, () => [...ctx.foco, ...ctx.comps]);
    } else {
      const ordem = [...ctx.foco].sort((a, b) =>
        dataKey(primeiraData(a.id)).localeCompare(dataKey(primeiraData(b.id))) || restante(b.id) - restante(a.id)
      );
      ordem.forEach(p => servir([p.id], m => [m]));
    }

    return {
      planos,
      linhas,
      bloqueios,
      coilsLivres: ctx.coils.filter(c => !usadas.has(c.id)).length,
      producaoPorProduto
    };
  }

  /** Escolha da bobina/corte de cada passo, conforme a visão. */
  private static escolher(
    cands: Candidato[],
    visao: VisaoOtimizacao,
    modo: 'normal' | 'dividir',
    bobinasQueFaltam: number,
    focoRestanteT: number,
    ultimoMapa: Map<number, number> | null,
    livres: Coil[]
  ): Candidato {
    const yieldDe = (c: Candidato) => c.combo.aproveitamentoPercent;
    const porYield = (a: Candidato, b: Candidato) => {
      if (Math.abs(yieldDe(b) - yieldDe(a)) > YIELD_TIE_PP) return yieldDe(b) - yieldDe(a);
      return b.focusCoveredT - a.focusCoveredT || b.coveredT - a.coveredT;
    };

    // Divide a demanda em bobinas menores para chegar ao mínimo de bobinas do planejamento.
    if (modo === 'dividir' && bobinasQueFaltam >= 1) {
      const alvo = focoRestanteT / bobinasQueFaltam;
      return [...cands].sort((a, b) => {
        const da = Math.abs(a.focusCoveredT - alvo);
        const db = Math.abs(b.focusCoveredT - alvo);
        if (Math.abs(da - db) > TOL_T) return da - db;
        return porYield(a, b);
      })[0];
    }

    if (visao === 'A') return [...cands].sort(porYield)[0];

    // Visão B: perde no máximo YIELD_TOL_B_PP de aproveitamento para repetir/aproximar a configuração de facas.
    const melhorYield = Math.max(...cands.map(yieldDe));
    let elegiveis = cands.filter(c => yieldDe(c) >= melhorYield - YIELD_TOL_B_PP);
    const melhorFoco = Math.max(...elegiveis.map(c => c.focusCoveredT));
    elegiveis = elegiveis.filter(c => c.focusCoveredT >= melhorFoco * 0.6);

    // Quantas bobinas livres conseguem repetir cada configuração (favorece configurações reaproveitáveis).
    const alcance = new Map<string, number>();
    elegiveis.forEach(c => {
      const tamanho = livres.filter(l => l.largura === c.coil.largura).length;
      alcance.set(c.sig, Math.max(alcance.get(c.sig) ?? 0, tamanho));
    });

    return [...elegiveis].sort((a, b) => {
      const ta = this.facasMovidas(ultimoMapa, this.assinatura(a.combo).mapa);
      const tb = this.facasMovidas(ultimoMapa, this.assinatura(b.combo).mapa);
      if (ta !== tb) return ta - tb;
      const ra = alcance.get(a.sig) ?? 0;
      const rb = alcance.get(b.sig) ?? 0;
      if (ra !== rb) return rb - ra;
      return porYield(a, b);
    })[0];
  }

  // ---------------------------------------------------------------------------
  // Consolidação: ordem de corte, setups, métricas e atendimento
  // ---------------------------------------------------------------------------

  private static textoTroca(anterior: Map<number, number> | null, novo: Map<number, number>): string {
    if (!anterior) return '';
    const partes: string[] = [];
    novo.forEach((n, w) => { const d = n - (anterior.get(w) ?? 0); if (d > 0) partes.push(`montar ${d}× ${w} mm`); });
    anterior.forEach((n, w) => { const d = n - (novo.get(w) ?? 0); if (d > 0) partes.push(`retirar ${d}× ${w} mm`); });
    return partes.join(' · ');
  }

  /**
   * Sequência de corte conforme a visão. A data de programação manda (grupos por data e espessura em ordem);
   * dentro de cada grupo:
   *  - Visão B: ordena as configurações de facas para somar o MENOR número de facas movimentadas
   *    (testa todas as ordens quando são até 7 configurações; senão, vizinho mais próximo);
   *  - Visão A: começa pelos cortes de maior aproveitamento, sem se preocupar com as trocas.
   */
  private static sequenciar(
    brutos: { coil: Coil; combo: SlitterCombination; dataFoco: string; sig: string; idx: number }[],
    visao: VisaoOtimizacao
  ): { planos: PlanoBobina[]; setups: number; trocas: number } {
    const chaveBloco = (c: Coil) => String(Math.round(c.espessura * 1000)).padStart(6, '0');
    const grupos = new Map<string, typeof brutos>();
    brutos.forEach(p => {
      const k = `${dataKey(p.dataFoco)}|${chaveBloco(p.coil)}`;
      grupos.set(k, [...(grupos.get(k) ?? []), p]);
    });

    const ordenados: typeof brutos = [];
    let anterior: Map<number, number> | null = null;
    Array.from(grupos.keys()).sort().forEach(k => {
      const lista = grupos.get(k)!;
      const porSig = new Map<string, typeof brutos>();
      lista.forEach(p => porSig.set(p.sig, [...(porSig.get(p.sig) ?? []), p]));
      let configs = Array.from(porSig.values()).map(g => ({ itens: g, mapa: this.assinatura(g[0].combo).mapa }));

      if (visao === 'B') {
        const custo = (ordem: typeof configs) => {
          let c = 0;
          let ant = anterior;
          ordem.forEach(x => { c += this.facasMovidas(ant, x.mapa); ant = x.mapa; });
          return c;
        };
        if (configs.length <= 7) {
          let melhor = configs;
          let melhorCusto = Infinity;
          const permutar = (resto: typeof configs, atual: typeof configs) => {
            if (resto.length === 0) {
              const c = custo(atual);
              if (c < melhorCusto) { melhorCusto = c; melhor = atual; }
              return;
            }
            resto.forEach((x, i) => permutar([...resto.slice(0, i), ...resto.slice(i + 1)], [...atual, x]));
          };
          permutar(configs, []);
          configs = melhor;
        } else {
          const resto = [...configs];
          const ord: typeof configs = [];
          let ant = anterior;
          while (resto.length) {
            let bi = 0;
            resto.forEach((x, i) => { if (this.facasMovidas(ant, x.mapa) < this.facasMovidas(ant, resto[bi].mapa)) bi = i; });
            const [x] = resto.splice(bi, 1);
            ord.push(x);
            ant = x.mapa;
          }
          configs = ord;
        }
      } else {
        const yieldMax = (x: (typeof configs)[number]) => Math.max(...x.itens.map(p => p.combo.aproveitamentoPercent));
        configs.forEach(x => x.itens.sort((a, b) => b.combo.aproveitamentoPercent - a.combo.aproveitamentoPercent));
        configs = [...configs].sort((a, b) => yieldMax(b) - yieldMax(a) || b.itens.length - a.itens.length);
      }

      configs.forEach(x => { ordenados.push(...x.itens); anterior = x.mapa; });
    });

    let ant: Map<number, number> | null = null;
    let antSig = '';
    let setups = 0;
    let trocas = 0;
    const planos: PlanoBobina[] = ordenados.map((p, i) => {
      const { sig, mapa } = this.assinatura(p.combo);
      const mudou = sig !== antSig;
      if (mudou) setups++;
      // Mesma configuração em outra bobina não troca facas; configuração diferente conta as facas movidas.
      const movidas = mudou ? this.facasMovidas(ant, mapa) : 0;
      const detalhe = mudou ? (ant ? this.textoTroca(ant, mapa) : 'montagem inicial das facas') : '';
      trocas += movidas;
      ant = mapa;
      antSig = sig;
      const usado = p.combo.totalLarguraUsada;
      return {
        ordem: i + 1,
        coil: p.coil,
        combination: p.combo,
        refilo: RefiloService.calcular(p.coil.largura - usado),
        setup: setups,
        setupSig: sig,
        trocasAntes: movidas,
        trocaDetalhe: detalhe,
        dataFoco: p.dataFoco,
        producaoT: round(p.coil.peso * (usado / p.coil.largura), 3),
        perdaT: round(p.coil.peso * ((p.coil.largura - usado) / p.coil.largura), 3),
        excedeDemanda: !!p.combo.excedeDemanda
      };
    });
    return { planos, setups, trocas };
  }

  /** Mesmo plano com a sequência refeita para outra visão (ex.: o plano da A servindo à B com menos trocas). */
  private static resequenciar(r: ResultadoCenario, visao: VisaoOtimizacao): ResultadoCenario {
    const { planos, setups, trocas } = this.sequenciar(
      r.planos.map((p, idx) => ({ coil: p.coil, combo: p.combination, dataFoco: p.dataFoco, sig: p.setupSig, idx })),
      visao
    );
    return { ...r, visao, planos, metricas: { ...r.metricas, setups, trocasFacas: trocas } };
  }

  private static montarResultado(
    visao: VisaoOtimizacao,
    cenario: CenarioProducao,
    blocos: BlocoCtx[],
    resultados: BlocoResultado[],
    idsFoco: Set<string>,
    bobinasCompativeis: number
  ): ResultadoCenario {
    const brutos = resultados.flatMap(r => r.planos.map((p, idx) => ({ ...p, idx })));
    const { planos, setups: setup, trocas } = this.sequenciar(brutos, visao);

    const linhas: LinhaDemanda[] = [];
    const produtos: ProdutoAtendimento[] = [];
    const restricoes: string[] = [];

    resultados.forEach((r, bi) => {
      const todos = new Map<string, Product>();
      [...blocos[bi].foco, ...blocos[bi].comps].forEach(p => todos.set(p.id, p));
      todos.forEach((product, id) => {
        const ls = r.linhas.filter(l => l.product.id === id);
        const demandaT = ls.reduce((a, l) => a + l.demandaT, 0);
        const wipT = ls.reduce((a, l) => a + l.wipT, 0);
        const planejadoT = ls.reduce((a, l) => a + l.planejadoT, 0);
        const producaoT = r.producaoPorProduto.get(id) ?? 0;
        const noEscopo = idsFoco.has(id);
        if (!noEscopo && producaoT <= 0) return;
        const atendidoT = Math.min(demandaT, wipT + planejadoT);
        const saldoT = Math.max(0, demandaT - atendidoT);
        const excedenteT = Math.max(0, producaoT - planejadoT);
        let motivoSaldo: string | undefined;
        if (noEscopo && saldoT > Math.max(TOL_T, demandaT * 0.02)) {
          motivoSaldo = r.bloqueios.get(id)
            ?? (blocos[bi].coils.length === 0
              ? `Sem bobina disponível de ${blocos[bi].espessura} mm`
              : r.coilsLivres === 0 ? 'Bobinas compatíveis esgotadas' : 'Demanda não coberta pelas bobinas escolhidas');
        }
        produtos.push({
          product, noEscopo, demandaT: round(demandaT, 3), wipT: round(wipT, 3), producaoT: round(producaoT, 3),
          atendidoT: round(atendidoT, 3), atendidoPercent: demandaT > 0 ? Math.min(100, round((atendidoT / demandaT) * 100, 1)) : 100,
          saldoT: round(saldoT, 3), excedenteT: round(excedenteT, 3), motivoSaldo
        });
        ls.forEach(l => {
          const at = Math.min(l.demandaT, l.wipT + l.planejadoT);
          linhas.push({
            product, data: l.data, demandaT: round(l.demandaT, 3), wipT: round(l.wipT, 3), planejadoT: round(l.planejadoT, 3),
            atendidoT: round(at, 3), saldoT: round(Math.max(0, l.demandaT - at), 3)
          });
        });
      });
    });
    linhas.sort((a, b) => dataKey(a.data).localeCompare(dataKey(b.data)) || a.product.codigo.localeCompare(b.product.codigo));
    produtos.sort((a, b) => Number(b.noEscopo) - Number(a.noEscopo) || b.demandaT - a.demandaT);

    const escopo = produtos.filter(p => p.noEscopo);
    const demandaT = escopo.reduce((a, p) => a + p.demandaT, 0);
    const atendidoT = escopo.reduce((a, p) => a + p.atendidoT, 0);
    const pesoBobinasT = planos.reduce((a, p) => a + p.coil.peso, 0);
    const producaoT = planos.reduce((a, p) => a + p.producaoT, 0);
    const media = (f: (p: PlanoBobina) => number) => (planos.length ? planos.reduce((a, p) => a + f(p), 0) / planos.length : 0);

    const metricas: MetricasCenario = {
      qtdBobinas: planos.length,
      pesoBobinasT: round(pesoBobinasT, 2),
      producaoT: round(producaoT, 2),
      perdasT: round(planos.reduce((a, p) => a + p.perdaT, 0), 2),
      aproveitamentoPercent: pesoBobinasT > 0 ? round((producaoT / pesoBobinasT) * 100, 2) : 0,
      refiloMedioMm: round(media(p => p.refilo.totalMm), 1),
      refiloMinMm: planos.length ? Math.min(...planos.map(p => p.refilo.totalMm)) : 0,
      refiloMaxMm: planos.length ? Math.max(...planos.map(p => p.refilo.totalMm)) : 0,
      refiloEsqMedioMm: round(media(p => p.refilo.esquerdoMm), 1),
      refiloDirMedioMm: round(media(p => p.refilo.direitoMm), 1),
      setups: setup,
      trocasFacas: trocas,
      demandaT: round(demandaT, 2),
      atendidoT: round(atendidoT, 2),
      atendimentoPercent: demandaT > 0 ? round((atendidoT / demandaT) * 100, 1) : 0,
      saldoT: round(escopo.reduce((a, p) => a + p.saldoT, 0), 2),
      excedenteT: round(produtos.reduce((a, p) => a + p.excedenteT, 0), 2)
    };

    // Mínimo de bobinas (regra padrão) — sinaliza o motivo, nunca força bobina incompatível.
    const atendido = planos.length >= MIN_BOBINAS_PLANEJAMENTO;
    let motivoMin: string | undefined;
    if (!atendido) {
      if (bobinasCompativeis < MIN_BOBINAS_PLANEJAMENTO) {
        motivoMin = `Só ${bobinasCompativeis} bobina(s) compatível(is) disponível(is) em estoque para a espessura do escopo.`;
      } else if (planos.length === 0) {
        motivoMin = 'Nenhuma bobina gerou corte válido para a demanda do escopo.';
      } else if (metricas.saldoT <= Math.max(TOL_T, demandaT * 0.02)) {
        motivoMin = `Demanda atendida com ${planos.length} bobina(s); chegar a ${MIN_BOBINAS_PLANEJAMENTO} exigiria produzir acima da demanda ou usar bobina que não gera corte válido.`;
      } else {
        motivoMin = `Apenas ${planos.length} bobina(s) geraram corte válido; as demais bobinas compatíveis não fecham refilo de 6–9 mm por lado (12–18 mm total) com a demanda restante.`;
      }
      restricoes.push(`Mínimo de ${MIN_BOBINAS_PLANEJAMENTO} bobinas não atingido: ${motivoMin}`);
    }
    escopo.filter(p => p.motivoSaldo).forEach(p => restricoes.push(`${p.product.codigo}: saldo de ${p.saldoT} t — ${p.motivoSaldo}.`));
    if (metricas.excedenteT > TOL_T) restricoes.push(`Produção acima da demanda de ${metricas.excedenteT} t — exige autorização nominal antes de emitir a OP.`);

    return { visao, cenario, planos, linhas, produtos, metricas, minBobinas: { requerido: MIN_BOBINAS_PLANEJAMENTO, atendido, motivo: motivoMin }, restricoes, bobinasCompativeis };
  }

  // ---------------------------------------------------------------------------
  // Comparação e recomendação
  // ---------------------------------------------------------------------------

  /** Negativo = a é melhor. Critério: atendimento -> excedente -> perdas (t) -> trocas de facas -> aproveitamento. */
  static comparar(a: ResultadoCenario, b: ResultadoCenario): number {
    const ma = a.metricas;
    const mb = b.metricas;
    if (Math.abs(ma.atendimentoPercent - mb.atendimentoPercent) > 1) return mb.atendimentoPercent - ma.atendimentoPercent;
    const tolExc = Math.max(TOL_T, Math.max(ma.producaoT, mb.producaoT) * 0.01);
    if (Math.abs(ma.excedenteT - mb.excedenteT) > tolExc) return ma.excedenteT - mb.excedenteT;
    const tolPerda = Math.max(0.05, Math.max(ma.producaoT, mb.producaoT) * 0.01);
    if (Math.abs(ma.perdasT - mb.perdasT) > tolPerda) return ma.perdasT - mb.perdasT;
    if (ma.trocasFacas !== mb.trocasFacas) return ma.trocasFacas - mb.trocasFacas;
    if (ma.setups !== mb.setups) return ma.setups - mb.setups;
    return mb.aproveitamentoPercent - ma.aproveitamentoPercent;
  }

  /** Melhor cenário (mesclada x separada) dentro de uma visão, com o motivo em texto. */
  static recomendarCenario(resultados: ResultadoCenario[], visao: VisaoOtimizacao): { melhor: CenarioProducao; motivo: string } {
    const m = resultados.find(r => r.visao === visao && r.cenario === 'MESCLADA');
    const s = resultados.find(r => r.visao === visao && r.cenario === 'SEPARADA');
    if (!m || !s) return { melhor: 'MESCLADA', motivo: '' };
    if (m.planos.length === 0 && s.planos.length === 0) return { melhor: 'MESCLADA', motivo: 'Nenhum dos dois cenários gerou plano válido (veja as restrições abaixo).' };
    if (s.equivalenteA) return { melhor: 'MESCLADA', motivo: 'Mesclada e separada resultam no mesmo plano para este escopo.' };
    const melhor = this.comparar(m, s) <= 0 ? m : s;
    const outro = melhor === m ? s : m;
    const dif: string[] = [];
    const mm = melhor.metricas;
    const mo = outro.metricas;
    if (Math.abs(mm.atendimentoPercent - mo.atendimentoPercent) > 1) dif.push(`atende ${mm.atendimentoPercent}% da demanda contra ${mo.atendimentoPercent}%`);
    if (Math.abs(mm.excedenteT - mo.excedenteT) > TOL_T) dif.push(`excedente de ${mm.excedenteT} t contra ${mo.excedenteT} t`);
    if (Math.abs(mm.perdasT - mo.perdasT) > 0.05) dif.push(`perda de ${mm.perdasT} t contra ${mo.perdasT} t`);
    if (mm.trocasFacas !== mo.trocasFacas) dif.push(`${mm.trocasFacas} troca(s) de facas contra ${mo.trocasFacas}`);
    if (dif.length === 0) dif.push(`aproveitamento de ${mm.aproveitamentoPercent}% contra ${mo.aproveitamentoPercent}%`);
    return { melhor: melhor.cenario, motivo: `${melhor.cenario === 'MESCLADA' ? 'Mesclada' : 'Separada'}: ${dif.join('; ')}.` };
  }

  /** Quanto da demanda pendente é falta de bobina em estoque e quanto é limite do corte — por espessura. */
  static coberturaPorEspessura(r: ResultadoCenario, coils: Coil[]): CoberturaEspessura[] {
    const disponiveis = coils.filter(c => c.status === 'Disponível');
    const mapa = new Map<number, { demanda: number; atendido: number }>();
    r.produtos.filter(p => p.noEscopo).forEach(p => {
      const e = round(p.product.espessura, 3);
      const m = mapa.get(e) ?? { demanda: 0, atendido: 0 };
      m.demanda += Math.max(0, p.demandaT - p.wipT);
      m.atendido += Math.max(0, p.atendidoT - p.wipT);
      mapa.set(e, m);
    });
    return Array.from(mapa.entries()).sort((a, b) => a[0] - b[0]).map(([espessura, m]) => {
      const cs = disponiveis.filter(c => Math.abs(c.espessura - espessura) < 0.001);
      const estoqueT = cs.reduce((a, c) => a + c.peso, 0);
      const faltaMpT = Math.max(0, m.demanda - estoqueT);
      const pendente = Math.max(0, m.demanda - m.atendido);
      return {
        espessura,
        demandaT: round(m.demanda, 2),
        qtdBobinas: cs.length,
        estoqueT: round(estoqueT, 2),
        atendidoT: round(m.atendido, 2),
        faltaMpT: round(faltaMpT, 2),
        limiteCorteT: round(Math.max(0, pendente - faltaMpT), 2)
      };
    });
  }

  /** Cortes do cenário prontos para o Estúdio de Corte / emissão da OP. */
  static paraEstudio(r: ResultadoCenario): OrderCoilInput[] {
    return r.planos.map(p => ({ coil: p.coil, strips: SlitterOptimizer.generateStripsFromCombination(p.combination, p.coil) }));
  }
}
