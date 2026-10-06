// Ferramentais de conformação (rolos da perfiladeira / tubeira), transcritos
// das abas "Ferramental" das planilhas de programação. Um mesmo ferramental
// atende vários produtos, em qualquer espessura:
// - Perfil U: cada linha agrupa o perfil enrijecido e o simples da mesma
//   alma x aba (ex: 75 x 40 x 15 e 75 x 40 usam o mesmo jogo de rolos).
// - Tubo: cada linha agrupa o redondo de um diâmetro com seus equivalentes
//   quadrado e retangular(es) (mesmo perímetro, mesmo jogo de rolos).

export interface PerfilFerramentalRow {
  enrijecido: [number, number, number][];
  simples: [number, number][];
}

// União das abas "Ferramental" de "Programação Perfis U - 3MM" e "- 4,75MM".
export const PERFIL_FERRAMENTAL_TABLE: PerfilFerramentalRow[] = [
  { enrijecido: [], simples: [[45, 17]] },
  { enrijecido: [[50, 25, 10]], simples: [[50, 25]] },
  { enrijecido: [], simples: [[68, 30]] },
  { enrijecido: [[75, 40, 15]], simples: [[75, 40]] },
  { enrijecido: [], simples: [[93, 30], [92, 40]] },
  { enrijecido: [[100, 40, 17]], simples: [[100, 40]] },
  { enrijecido: [[100, 50, 17]], simples: [[100, 50]] },
  { enrijecido: [], simples: [[120, 50], [120, 40], [120, 30]] },
  { enrijecido: [[127, 50, 17]], simples: [[127, 50]] },
  { enrijecido: [[150, 60, 20]], simples: [] },
  { enrijecido: [[150, 50, 20]], simples: [[150, 50]] },
  { enrijecido: [[200, 60, 20]], simples: [[200, 50]] },
  { enrijecido: [[200, 75, 20]], simples: [] },
  { enrijecido: [[210, 30, 15]], simples: [] }
];

export interface TuboFerramentalRow {
  diamPol: string;
  diamMm: number;
  quadrado: [number, number] | null;
  retangular: [number, number][];
}

// Aba "Ferramental" de "Programação de Tubos" (Marafon). A aba da Zikeli
// está vazia — diâmetros fora desta lista caem na tabela oficial de largura
// de tubos (TUBO_WIDTH_TABLE), que tem a mesma estrutura de equivalência.
export const TUBO_FERRAMENTAL_TABLE: TuboFerramentalRow[] = [
  { diamPol: '1"', diamMm: 25.4, quadrado: [20, 20], retangular: [] },
  { diamPol: '1.1/4"', diamMm: 31.75, quadrado: [25, 25], retangular: [[20, 30]] },
  { diamPol: '1.1/2"', diamMm: 38.1, quadrado: [30, 30], retangular: [[20, 40]] },
  { diamPol: '1.3/4"', diamMm: 44.45, quadrado: null, retangular: [[30, 40]] },
  { diamPol: '2"', diamMm: 50.8, quadrado: [40, 40], retangular: [[30, 50]] },
  { diamPol: '2.1/2"', diamMm: 63.5, quadrado: [50, 50], retangular: [[30, 70], [40, 60]] },
  { diamPol: '3"', diamMm: 76.2, quadrado: [60, 60], retangular: [[40, 80]] },
  { diamPol: '3.1/2"', diamMm: 88.9, quadrado: [70, 70], retangular: [[60, 80], [40, 100]] },
  { diamPol: '3.3/4"', diamMm: 95.25, quadrado: null, retangular: [[50, 100]] },
  { diamPol: '4"', diamMm: 101.6, quadrado: [80, 80], retangular: [[60, 100]] },
  { diamPol: '4.1/2"', diamMm: 114.3, quadrado: [90, 90], retangular: [[80, 100]] },
  { diamPol: '5"', diamMm: 127.0, quadrado: [100, 100], retangular: [] }
];
