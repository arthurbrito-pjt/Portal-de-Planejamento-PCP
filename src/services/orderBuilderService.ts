import { Coil, SlitterStrip, SlitterOrder, SlitterOrderCoil } from '../types/pcp';

export interface OrderFields {
  operador?: string;
  turno?: string;
  maquina?: string;
  observacoes?: string;
}

export interface OrderCoilInput {
  coil: Coil;
  strips: SlitterStrip[]; // fitas já definidas para ESSA bobina especificamente
}

/**
 * Monta e atualiza o objeto SlitterOrder — bobina(s) + fitas + dados
 * operacionais. Centralizado aqui para que a criação da OP a partir do
 * Planejamento e o salvamento/edição na tela de Ordem de Produção usem
 * exatamente o mesmo cálculo.
 *
 * Uma OP pode envolver mais de uma bobina matriz física (quando nenhum lote
 * sozinho cobre a demanda) — cada bobina tem seu próprio plano de corte e é
 * consumida do estoque individualmente. Os campos agregados no topo do
 * SlitterOrder (bobinaCodigo, fitas, aproveitamentoPercent, etc.) são sempre
 * derivados de `bobinas`, nunca a fonte da verdade.
 */
export class OrderBuilderService {
  /** Cria uma OP nova a partir de uma ou mais bobinas com seus cortes já definidos. */
  static buildNew(coilInputs: OrderCoilInput[], fields: OrderFields): SlitterOrder {
    const numeroOP = `OP-SLT-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

    let seq = 1;
    const bobinas: SlitterOrderCoil[] = coilInputs.map(({ coil, strips }) => {
      // Renumera sequencialmente através de todas as bobinas da OP (numeração
      // contínua nas etiquetas físicas) e marca a origem física de cada fita.
      const renumberedStrips = strips.map(s => ({
        ...s,
        stripNumber: seq++,
        bobinaLote: coil.lote,
        bobinaCodigo: coil.codigo
      }));

      const totalUsedWidth = renumberedStrips.reduce((acc, s) => acc + s.largura, 0);
      const sobraMm = Math.max(0, coil.largura - totalUsedWidth);
      const aproveitamentoPercent = Number(((totalUsedWidth / coil.largura) * 100).toFixed(2));
      const perdaPercent = Number(((sobraMm / coil.largura) * 100).toFixed(2));
      const sobraPesoTon = Number((coil.peso * (sobraMm / coil.largura)).toFixed(3));

      return {
        coilId: coil.id,
        bobinaCodigo: coil.codigo,
        bobinaLote: coil.lote,
        bobinaLargura: coil.largura,
        bobinaEspessura: coil.espessura,
        bobinaPesoOriginal: coil.peso,
        fitas: renumberedStrips,
        totalFitas: renumberedStrips.length,
        totalLarguraFitas: totalUsedWidth,
        sobraMm,
        sobraPesoTon,
        aproveitamentoPercent,
        perdaPercent
      };
    });

    const primary = bobinas[0];
    const allFitas = bobinas.flatMap(b => b.fitas);
    const bobinaPesoOriginal = Number(bobinas.reduce((acc, b) => acc + b.bobinaPesoOriginal, 0).toFixed(3));
    const sobraPesoTon = Number(bobinas.reduce((acc, b) => acc + b.sobraPesoTon, 0).toFixed(3));
    const totalLarguraFitas = bobinas.reduce((acc, b) => acc + b.totalLarguraFitas, 0);
    const perdaPercent = bobinaPesoOriginal > 0 ? Number(((sobraPesoTon / bobinaPesoOriginal) * 100).toFixed(2)) : 0;
    const aproveitamentoPercent = Number((100 - perdaPercent).toFixed(2));
    // sobraMm (mm) não soma fisicamente entre bobinas de larguras diferentes —
    // com 1 bobina só, preserva o valor exato; com várias, resume como média
    // ponderada pelo peso só para exibição agregada (cada bobina mostra seu
    // próprio refilo real na tela de OP).
    const sobraMm = bobinas.length <= 1
      ? (primary?.sobraMm ?? 0)
      : Number((bobinas.reduce((acc, b) => acc + b.sobraMm * b.bobinaPesoOriginal, 0) / bobinaPesoOriginal).toFixed(1));

    return {
      id: `ORD_${Date.now()}`,
      numeroOP,
      numeroOS: numeroOP,
      dataCriacao: new Date().toISOString().split('T')[0],

      bobinas,

      bobinaId: primary.coilId,
      bobinaCodigo: primary.bobinaCodigo,
      bobinaLote: bobinas.map(b => b.bobinaLote).join(' + '),
      bobinaLargura: primary.bobinaLargura,
      bobinaEspessura: primary.bobinaEspessura,
      bobinaPesoOriginal,

      fitas: allFitas,
      totalFitas: allFitas.length,
      totalLarguraFitas,
      sobraMm,
      sobraPesoTon,
      aproveitamentoPercent,
      perdaPercent,

      status: 'Liberada',
      operador: fields.operador,
      turno: fields.turno,
      maquina: fields.maquina,
      observacoes: fields.observacoes
    };
  }

  /** Atualiza somente os campos operacionais de uma OP já existente — nunca recalcula bobinas/fitas/status. */
  static updateFields(existing: SlitterOrder, fields: OrderFields): SlitterOrder {
    return {
      ...existing,
      operador: fields.operador,
      turno: fields.turno,
      maquina: fields.maquina,
      observacoes: fields.observacoes
    };
  }
}
