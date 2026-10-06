import { Product } from '../types/pcp';
import { PERFIL_FERRAMENTAL_TABLE, TUBO_FERRAMENTAL_TABLE, TuboFerramentalRow } from '../data/ferramentalConformacao';
import { TUBO_WIDTH_TABLE } from '../data/tuboWidthTable';
import { extractDimsSegment, extractTuboTipo } from './descricaoParser';

export type MaquinaConformacao = 'Perfiladeira' | 'Tubo Marafon' | 'Tubo Zikeli';

export const MAQUINAS_CONFORMACAO: MaquinaConformacao[] = ['Perfiladeira', 'Tubo Marafon', 'Tubo Zikeli'];

export interface FerramentalConformacao {
  codigo: string;
  nome: string;
  familia: 'TUBO' | 'PERFIL';
  maquina: MaquinaConformacao;
}

// Tolerância para casar dimensões da descrição com a tabela (ex: "92 x 30"
// do cadastro contra "93 x 30" da aba Ferramental, ou 31,7 vs 31,75 mm).
const DIM_TOL_MM = 1.5;

const near = (a: number, b: number) => Math.abs(a - b) <= DIM_TOL_MM;
const sameSeq = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => near(v, b[i]));
const samePair = (p: [number, number], dims: number[]) =>
  dims.length === 2 && ((near(p[0], dims[0]) && near(p[1], dims[1])) || (near(p[0], dims[1]) && near(p[1], dims[0])));

const fmtPair = (p: number[]) => p.join('x');
const fmtMm = (n: number) => n.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');

// Diâmetros da aba Ferramental (Marafon) primeiro; os que faltam (ex: tubos
// pequenos da Zikeli, cuja aba está vazia) vêm da tabela oficial de tubos.
const TUBO_ROWS: TuboFerramentalRow[] = [
  ...TUBO_FERRAMENTAL_TABLE,
  ...TUBO_WIDTH_TABLE
    .filter(r => !TUBO_FERRAMENTAL_TABLE.some(t => near(t.diamMm, r.diamMm)))
    .map(r => ({ diamPol: r.diamPol, diamMm: r.diamMm, quadrado: r.quadrado, retangular: r.retangular }))
].sort((a, b) => a.diamMm - b.diamMm);

/**
 * Separa espessura e dimensões do perfil a partir da descrição. A maioria das
 * descrições traz a espessura primeiro ("PERFIL U ENRIJ LQ 2,00 X 75 X 40 X 15"),
 * mas os perfis dobrados da linha pesada trazem por último
 * ("PERFIL U DOBR 150X50X3,75MM") — uma espessura > 10 mm não é plausível.
 */
function splitPerfilDims(tokens: number[]): { espessura: number; dims: number[] } {
  if (tokens[0] > 10) return { espessura: tokens[tokens.length - 1], dims: tokens.slice(0, -1) };
  return { espessura: tokens[0], dims: tokens.slice(1) };
}

export class FerramentalConformacaoService {
  /**
   * Máquina de conformação que produz o item — independe de o item ter
   * ferramental mapeado. Tubos TBZ (zincados) saem da Zikeli, os demais da
   * Marafon; perfis U saem da perfiladeira.
   */
  static maquina(product: Product): MaquinaConformacao {
    if (product.familia === 'PERFIL') return 'Perfiladeira';
    return product.codigo.toUpperCase().startsWith('TBZ') ? 'Tubo Zikeli' : 'Tubo Marafon';
  }

  private static cache = new Map<string, FerramentalConformacao | null>();

  /** Ferramental de conformação (perfiladeira/tubeira) que produz o item, ou null se não mapeado. */
  static resolve(product: Product): FerramentalConformacao | null {
    const key = `${product.codigo}|${product.descricao}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const result = this.compute(product);
    this.cache.set(key, result);
    return result;
  }

  private static compute(product: Product): FerramentalConformacao | null {
    const tokens = extractDimsSegment(product.descricao || '');
    if (!tokens || tokens.length < 2) return null;

    if (product.familia === 'PERFIL') {
      const { dims } = splitPerfilDims(tokens);
      const idx = PERFIL_FERRAMENTAL_TABLE.findIndex(row =>
        (dims.length === 3 && row.enrijecido.some(e => sameSeq(e, dims))) ||
        (dims.length === 2 && row.simples.some(s => sameSeq(s, dims)))
      );
      if (idx < 0) return null;
      const row = PERFIL_FERRAMENTAL_TABLE[idx];
      const base = row.simples[0] || row.enrijecido[0].slice(0, 2);
      const partes = [
        row.enrijecido.length ? `Enrij. ${row.enrijecido.map(fmtPair).join(' / ')}` : '',
        row.simples.length ? `Simples ${row.simples.map(fmtPair).join(' / ')}` : ''
      ].filter(Boolean).join(' · ');
      return {
        codigo: `FERR-PU-${fmtPair(base)}`,
        nome: `Perfil U ${base[0]} x ${base[1]} (${partes})`,
        familia: 'PERFIL',
        maquina: 'Perfiladeira'
      };
    }

    if (product.familia === 'TUBO') {
      const tipo = extractTuboTipo(product.descricao);
      if (!tipo) return null;
      const dims = tokens.slice(1);
      const row = TUBO_ROWS.find(r =>
        (tipo === 'RD' && dims.length === 1 && near(r.diamMm, dims[0])) ||
        (tipo === 'QD' && !!r.quadrado && samePair(r.quadrado, dims)) ||
        (tipo === 'RT' && r.retangular.some(p => samePair(p, dims)))
      );
      if (!row) return null;
      // Mesma bitola em tubeiras diferentes = jogos de rolos diferentes.
      const maquina = this.maquina(product);
      const nomeMaquina = maquina.replace('Tubo ', '');
      const equivalentes = [
        row.quadrado ? `QD ${fmtPair(row.quadrado)}` : '',
        row.retangular.length ? `RT ${row.retangular.map(fmtPair).join(' / ')}` : ''
      ].filter(Boolean).join(' · ');
      return {
        codigo: `FERR-TB-${nomeMaquina.slice(0, 3).toUpperCase()}-${fmtMm(row.diamMm)}`,
        nome: `Tubo ${nomeMaquina} Ø ${row.diamPol} (${fmtMm(row.diamMm)} mm)${equivalentes ? ` · ${equivalentes}` : ''}`,
        familia: 'TUBO',
        maquina
      };
    }

    return null;
  }
}
