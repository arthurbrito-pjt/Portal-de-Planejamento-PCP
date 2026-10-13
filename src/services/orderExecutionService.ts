import { Coil, FaltaMateriaPrimaRegistro, OrderExecucao, Product, SlitterOrder } from '../types/pcp';

export class OrderExecutionService {
  /** Tempo de processo em minutos entre início e fim lançados na OP. */
  static tempoProcessoMin(exec?: OrderExecucao): number | null {
    if (!exec?.inicioEm || !exec?.fimEm) return null;
    const diff = (new Date(exec.fimEm).getTime() - new Date(exec.inicioEm).getTime()) / 60000;
    return Number.isFinite(diff) && diff >= 0 ? Math.round(diff) : null;
  }

  /** Sucata gerada na execução: pesagem depois menos pesagem antes (kg). */
  static sucataRealKg(exec?: OrderExecucao): number | null {
    if (exec?.sucataAntesKg === undefined || exec?.sucataDepoisKg === undefined) return null;
    const diff = exec.sucataDepoisKg - exec.sucataAntesKg;
    return diff >= 0 ? Number(diff.toFixed(1)) : null;
  }

  static formatDuration(min: number | null): string {
    if (min === null) return '—';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m}min`;
  }

  /**
   * Itens em demanda, da mesma espessura da OP, que ficaram fora do corte e não
   * têm matéria-prima disponível para uma próxima OP. A MP disponível é
   * distribuída pela ordem de maior demanda, então a falta de cada item é o que
   * sobra descoberto depois de alocar o estoque.
   */
  static computeFaltasMateriaPrima(
    order: SlitterOrder,
    products: Product[],
    coils: Coil[]
  ): FaltaMateriaPrimaRegistro[] {
    const produzidos = new Set(order.fitas.map(f => f.productId));
    const espessuras = Array.from(new Set(order.bobinas.map(b => b.bobinaEspessura)));
    const registros: FaltaMateriaPrimaRegistro[] = [];

    for (const esp of espessuras) {
      let disponivelT = coils
        .filter(c => c.status === 'Disponível' && Math.abs(c.espessura - esp) < 0.001)
        .reduce((acc, c) => acc + c.peso, 0);
      const disponivelInicial = Number(disponivelT.toFixed(3));

      const pendentes = products
        .filter(p => (p.demandaT || 0) > 0 && Math.abs(p.espessura - esp) < 0.001 && !produzidos.has(p.id))
        .sort((a, b) => (b.demandaT || 0) - (a.demandaT || 0));

      for (const p of pendentes) {
        const demanda = p.demandaT || 0;
        const alocado = Math.min(disponivelT, demanda);
        disponivelT -= alocado;
        const falta = Number((demanda - alocado).toFixed(3));
        if (falta <= 0) continue;
        registros.push({
          id: `FALTA_${order.id}_${p.id}`,
          data: new Date().toISOString(),
          orderId: order.id,
          numeroOP: order.numeroOP,
          produtoId: p.id,
          produtoCodigo: p.codigo,
          descricao: p.descricao,
          espessura: esp,
          demandaT: demanda,
          mpDisponivelT: disponivelInicial,
          faltaT: falta
        });
      }
    }
    return registros;
  }
}
