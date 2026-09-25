import * as XLSX from 'xlsx';
import { Coil, Product, SlitterOrder } from '../types/pcp';
import { SlitterCatalogService } from './slitterCatalogService';

export interface ProductImportResult {
  products: Product[]; // produtos novos ou com demanda atualizada, prontos para StorageService.addProduct
  naoEncontrados: { codigo: string; descricao: string; qtd: number }[]; // sem espessura/largura reconhecível — precisam de cadastro manual
}

// Nome da aba de demanda varia entre as planilhas recebidas mensalmente
// ("prog im", "Prog_IM", "prog_im", "prog, IM"...) mas é sempre a mesma sigla.
// Normaliza removendo acentos, espaços e pontuação para casar qualquer variação.
function normalizeSheetName(name: string): string {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function findProgImSheet(sheetNames: string[]): string | null {
  return sheetNames.find(n => normalizeSheetName(n) === 'progim') || null;
}

// Extrai espessura + dimensões de uma descrição de produto, ex:
// "PERFIL U ENRIJ LQ 2,00 X 100 X 40 X 17 MM" -> [2.00, 100, 40, 17]
// "TUBO IND LQ RD 1,50 X 48,30 NBR6591" -> [1.50, 48.30]
// O primeiro número é sempre a espessura; os demais são as dimensões do perfil/tubo.
function extractDimsSegment(desc: string): number[] | null {
  const m = desc.match(/(\d+(?:,\d+)?(?:\s*[Xx]\s*\d+(?:,\d+)?)+)/);
  if (!m) return null;
  const tokens = m[1].split(/[Xx]/).map(t => parseFloat(t.trim().replace(',', '.')));
  return tokens.some(Number.isNaN) ? null : tokens;
}

// Formato do tubo (RD=redondo, QD=quadrado, RT=retangular), indicado na
// descrição logo antes da espessura, ex: "TUBO IND LQ RD 1,50 X 48,30 NBR6591".
function extractTuboTipo(desc: string): 'RD' | 'QD' | 'RT' | null {
  const m = desc.match(/\b(RD|QD|RT)\b/i);
  return m ? (m[1].toUpperCase() as 'RD' | 'QD' | 'RT') : null;
}

function inferFamilia(codigo: string, descricao: string): 'TUBO' | 'PERFIL' | null {
  const c = codigo.toUpperCase();
  if (c.startsWith('PRF') || c.startsWith('PMG')) return 'PERFIL';
  if (c.startsWith('TBI') || c.startsWith('TBZ')) return 'TUBO';
  const d = descricao.toUpperCase();
  if (d.includes('PERFIL')) return 'PERFIL';
  if (d.includes('TUBO')) return 'TUBO';
  return null;
}

export class ExcelService {
  /**
   * Parse uploaded Excel file for Coils
   */
  static parseCoilsFile(fileBuffer: ArrayBuffer): Coil[] {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

    if (rows.length < 2) return [];

    const coils: Coil[] = [];
    const header = (rows[0] as any[]).map(c => String(c).toLowerCase().trim());
    
    // Find column indexes
    const idxCodigo = header.findIndex(h => h.includes('item') || h.includes('codigo') || h.includes('cód'));
    const idxLote = header.findIndex(h => h.includes('lote'));
    const idxEsp = header.findIndex(h => h.includes('esp'));
    const idxLarg = header.findIndex(h => h.includes('larg') || h.includes('bobina'));
    const idxPeso = header.findIndex(h => h.includes('peso') || h.includes('saldo') || h.includes('ton'));

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as any[];
      if (!row || row.length === 0) continue;

      const codigo = idxCodigo >= 0 ? String(row[idxCodigo] || '').trim() : `BOB-${i}`;
      const lote = idxLote >= 0 ? String(row[idxLote] || '').trim() : `LOTE-${i}`;
      const espessura = idxEsp >= 0 ? Number(parseFloat(String(row[idxEsp]).replace(',', '.')) || 0) : 0;
      const largura = idxLarg >= 0 ? Number(parseFloat(String(row[idxLarg]).replace(',', '.')) || 0) : 0;
      const peso = idxPeso >= 0 ? Number(parseFloat(String(row[idxPeso]).replace(',', '.')) || 0) : 0;

      if (largura > 0 && espessura > 0) {
        coils.push({
          id: `COIL_IMP_${Date.now()}_${i}`,
          codigo: codigo || `BQN-${Math.round(espessura * 1000)}`,
          lote: lote || `LOT-${i}`,
          espessura,
          largura,
          peso: peso || 10.0,
          quantidade: 1,
          status: 'Disponível',
          dataRecebimento: new Date().toISOString().split('T')[0]
        });
      }
    }

    return coils;
  }

  /**
   * Parse uploaded Excel file for Products & Demand.
   *
   * Lê especificamente a aba "PROG IM" (nome varia entre planilhas: "prog im",
   * "Prog_IM", "prog_im", "prog, IM"...), que traz a demanda mensal com colunas
   * Item / Descrição / Data / Fornecedor / Qtd — Qtd já em toneladas.
   *
   * Itens cujo código já existe no cadastro (`existingProducts`) têm a demanda
   * atualizada mantendo os demais dados cadastrados. Itens novos têm espessura
   * e largura de fita derivadas da própria descrição via catálogo oficial de
   * slitters (perfil); quando não é possível derivar com segurança (ex: tubos
   * ainda sem o catálogo de blanks digitalizado), o item vai para
   * `naoEncontrados` em vez de entrar com dados inventados.
   */
  static parseProductsFile(fileBuffer: ArrayBuffer, existingProducts: Product[] = []): ProductImportResult {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = findProgImSheet(workbook.SheetNames);
    if (!sheetName) return { products: [], naoEncontrados: [] };

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
    if (rows.length < 2) return { products: [], naoEncontrados: [] };

    const header = (rows[0] as any[]).map(c => String(c ?? '').toLowerCase().trim());
    const idxItem = header.findIndex(h => h.includes('item') || h.includes('cód') || h.includes('cod'));
    const idxDesc = header.findIndex(h => h.includes('descr'));
    const idxQtd = header.findIndex(h => h.includes('qtd') || h.includes('quant'));
    if (idxItem < 0 || idxQtd < 0) return { products: [], naoEncontrados: [] };

    const products: Product[] = [];
    const naoEncontrados: ProductImportResult['naoEncontrados'] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as any[];
      if (!row || row.length === 0) continue;

      const codigo = String(row[idxItem] ?? '').trim();
      if (!codigo) continue;
      const descricao = idxDesc >= 0 ? String(row[idxDesc] ?? '').trim() : '';
      const qtd = Number(parseFloat(String(row[idxQtd] ?? '0').replace(',', '.')) || 0);

      const existing = existingProducts.find(p => p.codigo === codigo);

      // Algumas planilhas têm um bloco de totais/resumo logo abaixo da tabela
      // de itens (ex: "Total solicitações...", "Máquina/Ferramental", contagem
      // por ferramental) que cai nas mesmas colunas — não é um código de item
      // real (letras+números) e/ou não tem quantidade, então é seguro descartar.
      if (!existing && (!descricao || qtd === 0 || !/^[A-Za-z]{2,6}\d/.test(codigo))) continue;

      if (existing) {
        products.push({ ...existing, descricao: descricao || existing.descricao, demandaT: qtd });
        continue;
      }

      const familia = inferFamilia(codigo, descricao);
      const dims = descricao ? extractDimsSegment(descricao) : null;
      const espessura = dims && dims.length > 0 ? dims[0] : 0;
      let larguraFita: number | null = null;
      if (dims && dims.length > 1 && espessura > 0) {
        if (familia === 'PERFIL') {
          larguraFita = SlitterCatalogService.findPerfilBlankByDims(dims.slice(1), espessura);
        } else if (familia === 'TUBO') {
          const tipo = extractTuboTipo(descricao);
          if (tipo) {
            larguraFita = SlitterCatalogService.findTuboBlankByDims(tipo, dims.slice(1), espessura);
          }
        }
      }

      if (familia && espessura > 0 && larguraFita) {
        products.push({
          id: `PROD_IMP_${codigo}`,
          codigo,
          descricao: descricao || codigo,
          tipo: familia,
          espessura,
          larguraFita,
          demandaT: qtd,
          familia
        });
      } else {
        naoEncontrados.push({ codigo, descricao, qtd });
      }
    }

    return { products, naoEncontrados };
  }

  /**
   * Export Slitter Order to formatted Excel sheet
   */
  static exportSlitterOrderToExcel(order: SlitterOrder): void {
    const wb = XLSX.utils.book_new();
    const opNumber = order.numeroOP || order.numeroOS || 'OP-SLT-001';

    // 1. Order Header
    const headerData = [
      ['PORTAL DE PLANEJAMENTO PCP - ORDEM DE PRODUÇÃO (OP) DE SLITTER'],
      ['Número OP:', opNumber, 'Data:', order.dataCriacao, 'Status:', order.status],
      [''],
      ['DADOS DA BOBINA DE MATÉRIA-PRIMA'],
      ['Código da Bobina:', order.bobinaCodigo, 'Lote:', order.bobinaLote],
      ['Largura Total (mm):', order.bobinaLargura, 'Espessura (mm):', order.bobinaEspessura, 'Peso Original (t):', order.bobinaPesoOriginal],
      [''],
      ['APROVEITAMENTO E INDICADORES'],
      ['Largura Útil (mm):', order.totalLarguraFitas, 'Refilo Técnico (mm):', order.sobraMm],
      ['Aproveitamento (%):', `${order.aproveitamentoPercent}%`, 'Perda (%):', `${order.perdaPercent}%`, 'Peso Refilo (t):', order.sobraPesoTon],
      [''],
      ['PROGRAMAÇÃO DE FITAS DE SLITTER & DESTINAÇÃO DE USO'],
      ['Fita Slitter', 'Código Slitter', 'Nome do Slitter', 'Material de Destino (Produto Final)', 'Código Destino', 'Família', 'Largura Fita (mm)', 'Espessura (mm)', 'Peso Alocado (t)', 'Peso (kg)', 'Metros Lineares (m)']
    ];

    // 2. Strips Data
    const stripsRows = order.fitas.map(f => {
      const slt = SlitterCatalogService.getSlitterInfo(f.largura, f.espessura);
      return [
        `Fita ${String(f.stripNumber).padStart(2, '0')}`,
        slt.code,
        slt.name,
        f.productDescription,
        f.productCode,
        f.productFamily,
        f.largura,
        f.espessura,
        f.pesoTon,
        f.pesoKg,
        f.metrosLineares
      ];
    });

    const finalSheetData = [...headerData, ...stripsRows];
    const ws = XLSX.utils.aoa_to_sheet(finalSheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 },
      { wch: 18 },
      { wch: 32 },
      { wch: 45 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, `OP_${opNumber}`);
    XLSX.writeFile(wb, `Ordem_Producao_${opNumber}.xlsx`);
  }

  /**
   * Export complete PCP Planning report to Excel
   */
  static exportReportsToExcel(coils: Coil[], products: Product[], orders: SlitterOrder[]): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ordens de Produção
    const ordersData = orders.map(o => ({
      'Número OP': o.numeroOP || o.numeroOS,
      'Data': o.dataCriacao,
      'Bobina Código': o.bobinaCodigo,
      'Lote': o.bobinaLote,
      'Espessura (mm)': o.bobinaEspessura,
      'Largura Bobina (mm)': o.bobinaLargura,
      'Peso Bobina (t)': o.bobinaPesoOriginal,
      'Qtd Fitas': o.totalFitas,
      'Largura Fitas (mm)': o.totalLarguraFitas,
      'Refilo Técnico (mm)': o.sobraMm,
      'Aproveitamento (%)': o.aproveitamentoPercent,
      'Status': o.status
    }));
    const wsOrders = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, wsOrders, 'Ordens de Produção (OP)');

    // Sheet 2: Estoque Bobinas
    const coilsData = coils.map(c => ({
      'Código': c.codigo,
      'Lote': c.lote,
      'Espessura (mm)': c.espessura,
      'Largura (mm)': c.largura,
      'Peso (t)': c.peso,
      'Status': c.status
    }));
    const wsCoils = XLSX.utils.json_to_sheet(coilsData);
    XLSX.utils.book_append_sheet(wb, wsCoils, 'Estoque Bobinas');

    // Sheet 3: Demanda e Produtos
    const prodsData = products.map(p => ({
      'Tipo': p.tipo,
      'Código': p.codigo,
      'Descrição': p.descricao,
      'Espessura (mm)': p.espessura,
      'Largura Fita (mm)': p.larguraFita,
      'Demanda (t)': p.demandaT || 0
    }));
    const wsProds = XLSX.utils.json_to_sheet(prodsData);
    XLSX.utils.book_append_sheet(wb, wsProds, 'Base Demanda');

    XLSX.writeFile(wb, `Relatorio_PCP_Slitter_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}
