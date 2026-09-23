export type ProductFamily = 'TUBO' | 'PERFIL';

export type GrauDificuldade = 'BAIXO' | 'MEDIO' | 'ALTO';

export interface Product {
  id: string;
  codigo: string;
  descricao: string;
  tipo: string; // TUBO or PERFIL
  espessura: number; // in mm, e.g. 1.5, 2.0, 4.75
  larguraFita: number; // in mm, e.g. 238, 240, 50, 101
  pesoPorMetro?: number; // kg/m
  familia: ProductFamily;
  demandaT?: number; // Demanda planejada em toneladas
  comprimentoPadrao?: number; // em metros, ex: 6m
  grauDificuldade?: GrauDificuldade; // Grau de dificuldade de produção
  volumePoliticaT?: { minimo: number; ideal: number; maximo: number }; // Política de lote (toneladas)
}

export type FerramentalClasse = 'A' | 'B' | 'C'; // A = Sempre roda | B = Regular | C = Menos roda (requer acúmulo de lote)

export interface Ferramental {
  id: string;
  codigo: string; // livre; pode coincidir com um código de slitter do catálogo
  nome: string;
  classe: FerramentalClasse; // 'A' | 'B' | 'C'
  larguraFita?: number; // mm — largura da fita cortada por este ferramental (associação com Product.larguraFita)
  espessura?: number; // mm — espessura da fita cortada por este ferramental (associação com Product.espessura)
  capacidadeMinimaT: number;
  capacidadeIdealT: number;
  capacidadeMaximaT: number;
  descricaoUso?: string;
}

// Estoque intermediário de slitter (fitas já cortadas aguardando conformação)
export interface SlitterIntermediaryItem {
  id: string;
  codigoSlitter: string;
  nomeSlitter: string;
  larguraFita: number; // mm
  espessura: number; // mm
  pesoDisponivelTon: number; // toneladas
  metrosLineares: number; // metros
  dataCorte: string;
  loteOrigem: string;
  localizacao?: string;
  familiaDestino?: ProductFamily;
}

export interface SlitterDemandItem {
  id: string; // e.g. SLT_238_1.5
  codigoSlitter: string; // e.g. SLT11020 ou SLT10238
  nomeSlitter: string; // e.g. SLITTER 75 x 40 x 1,80MM ou SLITTER 238 x 1,50MM
  larguraFita: number; // mm
  espessura: number; // mm
  totalDemandaT: number; // soma das demandas de perfis e tubos
  demandaTubosT: number; // total demanda vinda de tubos
  demandaPerfisT: number; // total demanda vinda de perfis
  qtdTubos: number;
  qtdPerfis: number;
  produtos: {
    product: Product;
    demandaT: number;
    familia: ProductFamily;
  }[];
  mainProduct: Product;
  status: 'PRONTO' | 'PARCIAL' | 'BLOQUEADO';
  ferramentalCadastrado: boolean; // false = código do slitter não está no cadastro de Ferramentais (Importador & Cadastros)
  compatibleLotCount: number;
  totalCompatibleWeightTon: number;
  coveragePercent: number;
  bestCoil: Coil | null;
  recommendedCoils?: Coil[]; // conjunto completo de bobinas para atingir a demanda efetiva (pode ser mais de uma)
  recommendedCombinations?: (SlitterCombination | null)[]; // plano de corte específico de cada bobina em recommendedCoils, na mesma ordem
  estimatedStrips: number;
  estimatedScrapMm: number;
  estimatedYieldPercent: number;
  bestCombination?: SlitterCombination | null;
  wipAvailableTon?: number; // estoque de slitter intermediário já cortado, disponível para esse item
  effectiveDemandTon?: number; // demanda que ainda precisa ser cortada após descontar o estoque intermediário
  coveredByWipOnly?: boolean; // demanda 100% atendida só com estoque intermediário
}

export type StatusContabil = 'CONCILIADO' | 'PENDENTE_AJUSTE';

export type CoilStatus = 'Disponível' | 'Reservada' | 'Em Produção' | 'Consumida';

export interface Coil {
  id: string;
  codigo: string; // ex: BQN10040, BQN10060, BQN20020
  lote: string; // ex: P3017012, P414274, OB01934
  espessura: number; // in mm, e.g. 1.5, 2.0, 4.75
  largura: number; // in mm, e.g. 1000, 1200, 1500
  peso: number; // in metric tons, e.g. 16.61
  quantidade: number; // usually 1
  status: CoilStatus;
  statusContabil?: StatusContabil; // 'CONCILIADO' ou 'PENDENTE_AJUSTE' (Físico presente, aguardando acerto contábil)
  estoqueFisico?: boolean; // true = bobina fisicamente no galpão
  dataRecebimento?: string;
  fornecedor?: string;
  localizacao?: string;
  observacoes?: string;
}

export interface CotacaoPrevisaoItem {
  produto: Product;
  diasPrevisao: number; // dias a mais (ex: 2 para regra D+2)
  dataPrevisaoTexto: string; // ex: "D+2 (10/09/2026)"
  statusAtendimento: 'PRONTA_ENTREGA' | 'EM_PRODUCAO_D2' | 'PROGRAMADO_D3' | 'AGUARDANDO_MP';
  origemMaterial: 'ESTOQUE_ACABADO' | 'ESTOQUE_SLITTER' | 'BOBINA_DISPONIVEL' | 'SEM_BOBINA';
  loteMinimoRecomendadoT: number;
  grauDificuldade: GrauDificuldade;
  detalhePrevisao: string;
  estoqueIntermediarioDisponivelTon: number;
  bobinasCompativeisTon: number;
}

export interface DayProductionMetrics {
  diaIndice: number; // 0 = Hoje, 1 = Amanhã, 2 = D+2
  dataIso: string;
  dataRotulo: string; // ex: "Hoje (08/09)", "Amanhã (09/09)", "D+2 (10/09)"
  volumeProgramadoTon: number;
  capacidadeNominalTon: number;
  folgaPlanejamentoPercent: number; // folga % de capacidade
  sucataMediaPercent: number;
  quantidadeSetups: number;
  toneladasPorSetup: number;
  alertaSetup?: string;
  ordensProgramadas: SlitterOrder[];
}

export interface SlitterStrip {
  id: string;
  stripNumber: number; // 1, 2, 3...
  productId: string;
  productCode: string;
  productDescription: string;
  productFamily: ProductFamily;
  largura: number; // mm
  espessura: number; // mm
  pesoTon: number; // calculated tons
  pesoKg: number; // calculated kg
  metrosLineares: number; // calculated linear meters
  cor: string; // hex or tailwind color
  bobinaLote?: string; // lote da bobina matriz física de origem (OP com múltiplas bobinas)
  bobinaCodigo?: string; // código da bobina matriz física de origem
}

export interface SlitterCombination {
  id: string;
  descricao: string;
  fitas: {
    product: Product;
    quantidade: number;
    larguraTotal: number;
  }[];
  totalLarguraUsada: number; // mm
  sobraMm: number; // mm
  aproveitamentoPercent: number; // %
  perdaPercent: number; // %
  pesoConsumidoTon: number;
  pesoSobraTon: number;
  classificacao: 'PERFEITO' | 'EXCELENTE' | 'BOM' | 'ATENÇÃO' | 'ALERTA';
  badgeTexto: string;
  prioridadeDemanda: boolean;
}

// Uma bobina matriz física cortada dentro de uma OP, com seu próprio plano de
// corte. Uma OP pode envolver mais de uma bobina quando nenhum lote sozinho
// cobre a demanda — cada bobina é cortada e consumida do estoque de forma
// independente, com seu próprio aproveitamento e refilo.
export interface SlitterOrderCoil {
  coilId: string;
  bobinaCodigo: string;
  bobinaLote: string;
  bobinaLargura: number;
  bobinaEspessura: number;
  bobinaPesoOriginal: number; // tons

  fitas: SlitterStrip[];
  totalFitas: number;
  totalLarguraFitas: number; // mm
  sobraMm: number; // mm
  sobraPesoTon: number; // tons
  aproveitamentoPercent: number; // %
  perdaPercent: number; // %
}

export interface SlitterOrder {
  id: string;
  numeroOP: string; // ex: OP-SLT-2026-001
  numeroOS?: string; // retrocompatibilidade
  dataCriacao: string;

  // Uma ou mais bobinas matriz efetivamente cortadas nesta OP, cada uma com
  // seu próprio plano de corte. Fonte da verdade para consumo de estoque.
  bobinas: SlitterOrderCoil[];

  // Campos agregados — sempre derivados de `bobinas` na montagem da OP
  // (OrderBuilderService). Mantidos no topo para compatibilidade com telas,
  // exportação Excel e etiquetas que exibem um resumo único da OP. Quando há
  // mais de uma bobina, representam a bobina principal (bobinas[0]) ou a
  // soma/média ponderada dos totais, conforme o campo.
  bobinaId: string;
  bobinaCodigo: string;
  bobinaLote: string;
  bobinaLargura: number;
  bobinaEspessura: number;
  bobinaPesoOriginal: number; // tons

  fitas: SlitterStrip[];
  totalFitas: number;
  totalLarguraFitas: number; // mm
  sobraMm: number; // mm
  sobraPesoTon: number; // tons
  aproveitamentoPercent: number; // %
  perdaPercent: number; // %

  status: 'Planejada' | 'Liberada' | 'Em Corte' | 'Concluída' | 'Cancelada';
  observacoes?: string;
  operador?: string;
  turno?: string;
  maquina?: string;
}

export interface CutHistoryItem {
  id: string;
  orderId: string;
  dataCorte: string;
  bobinaLote: string;
  bobinaLargura: number;
  bobinaEspessura: number;
  bobinaPesoTon: number;
  aproveitamentoPercent: number;
  sobraMm: number;
  totalFitas: number;
  resumoFitas: string;
  status: string;
}

export interface PCPKPIs {
  totalBobinasDisponiveis: number;
  pesoTotalEstoqueTon: number;
  aproveitamentoMedioPercent: number;
  totalOrdensAtivas: number;
  totalRefiloGeradoTon: number;
  demandaTotalTon: number;
  demandaAtendidaTon: number;
  taxaAtendimentoPercent: number;
}

// ---------------------------------------------------------------------------
// Agente de IA (Tela 7) — recomendações, alertas e resumo executivo gerados
// pelo agente a partir dos dados de PCP (estoque, demanda e programas de corte).
// ---------------------------------------------------------------------------

export type AIInsightSeverity = 'info' | 'atencao' | 'critico';
export type AIInsightCategory = 'estoque' | 'eficiencia' | 'demanda' | 'operacional';
export type AIPriority = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface AIInsight {
  titulo: string;
  categoria: AIInsightCategory;
  severidade: AIInsightSeverity;
  descricao: string;
  acaoSugerida?: string;
}

export interface AIRecommendation {
  titulo: string;
  programId?: string; // referencia o id de um SlitterProductionProgram, quando aplicável
  prioridade: AIPriority;
  justificativa: string;
  impactoEstimado?: string;
}

export interface AIAgentResult {
  geradoEm: string;
  mode?: 'recommendations' | 'alerts' | 'summary';
  resumo?: string;
  insights?: AIInsight[];
  recomendacoes?: AIRecommendation[];
}
