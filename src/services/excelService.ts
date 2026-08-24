import * as XLSX from 'xlsx';
import { Coil, Product, SlitterOrder } from '../types/pcp';

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
   * Parse uploaded Excel file for Products & Demand
   */
  static parseProductsFile(fileBuffer: ArrayBuffer): Product[] {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

    if (rows.length < 2) return [];

    const products: Product[] = [];
    const header = (rows[0] as any[]).map(c => String(c).toLowerCase().trim());

    const idxTipo = header.findIndex(h => h.includes('tipo') || h.includes('fam'));
    const idxCodigo = header.findIndex(h => h.includes('cód') || h.includes('item') || h.includes('cod'));
    const idxDesc = header.findIndex(h => h.includes('desc') || h.includes('prod'));
    const idxEsp = header.findIndex(h => h.includes('esp'));
    const idxLarg = header.findIndex(h => h.includes('larg') || h.includes('fita') || h.includes('blank'));
    const idxDem = header.findIndex(h => h.includes('dem') || h.includes('ton') || h.includes('qtd') || h.includes('prog'));

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as any[];
      if (!row || row.length === 0) continue;

      const tipoStr = idxTipo >= 0 ? String(row[idxTipo] || '').toUpperCase() : '';
      const codigo = idxCodigo >= 0 ? String(row[idxCodigo] || '').trim() : `PRD-${i}`;
      const desc = idxDesc >= 0 ? String(row[idxDesc] || '').trim() : `Produto ${i}`;
      const espessura = idxEsp >= 0 ? Number(parseFloat(String(row[idxEsp]).replace(',', '.')) || 0) : 0;
      const larguraFita = idxLarg >= 0 ? Number(parseFloat(String(row[idxLarg]).replace(',', '.')) || 0) : 0;
      const demandaT = idxDem >= 0 ? Number(parseFloat(String(row[idxDem]).replace(',', '.')) || 0) : 0;

      const familia = tipoStr.includes('PERFIL') || desc.toUpperCase().includes('PERFIL') ? 'PERFIL' : 'TUBO';

      if (larguraFita > 0 && espessura > 0) {
        products.push({
          id: `PROD_IMP_${Date.now()}_${i}`,
          codigo,
          descricao: desc,
          tipo: familia,
          espessura,
          larguraFita,
          demandaT: demandaT || 0,
          familia
        });
      }
    }

    return products;
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
      ['Fita Slitter', 'Material a Produzir com o Slitter', 'Código Item', 'Família', 'Largura Fita (mm)', 'Espessura (mm)', 'Peso Alocado (t)', 'Peso (kg)', 'Metros Lineares (m)']
    ];

    // 2. Strips Data
    const stripsRows = order.fitas.map(f => [
      `Fita ${String(f.stripNumber).padStart(2, '0')}`,
      f.productDescription,
      f.productCode,
      f.productFamily,
      f.largura,
      f.espessura,
      f.pesoTon,
      f.pesoKg,
      f.metrosLineares
    ]);

    const finalSheetData = [...headerData, ...stripsRows];
    const ws = XLSX.utils.aoa_to_sheet(finalSheetData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 },
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
