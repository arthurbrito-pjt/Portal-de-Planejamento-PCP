export type ProductFamily = 'TUBO' | 'PERFIL';

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
}

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
  dataRecebimento?: string;
  fornecedor?: string;
  localizacao?: string;
  observacoes?: string;
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

export interface SlitterOrder {
  id: string;
  numeroOS: string; // ex: SLT-2026-001
  dataCriacao: string;
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
