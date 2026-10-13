import { Coil, PlanTemplate, Product, SlitterStrip } from '../types/pcp';

export class StripFactory {
  /** Cria uma fita de um produto numa bobina, com peso e metragem proporcionais à largura. */
  static create(prod: Product, coil: Coil, stripNumber: number, largura: number = prod.larguraFita): SlitterStrip {
    const pesoTon = Number((coil.peso * (largura / coil.largura)).toFixed(3));
    const pesoKg = Math.round(pesoTon * 1000);
    const kgPerMeter = largura * coil.espessura * 7.85 / 1000;
    return {
      id: `STRIP_${Date.now()}_${stripNumber}_${Math.random().toString(36).substring(2, 6)}`,
      stripNumber,
      productId: prod.id,
      productCode: prod.codigo,
      productDescription: prod.descricao,
      productFamily: prod.familia,
      largura,
      espessura: coil.espessura,
      pesoTon,
      pesoKg,
      metrosLineares: kgPerMeter > 0 ? Math.round(pesoKg / kgPerMeter) : 0,
      cor: '#EA580C',
      bobinaLote: coil.lote,
      bobinaCodigo: coil.codigo
    };
  }

  static fromTemplate(template: PlanTemplate, coil: Coil, products: Product[]): SlitterStrip[] {
    const strips: SlitterStrip[] = [];
    for (const f of template.fitas) {
      const prod = products.find(p => p.id === f.productId || p.codigo === f.productCode);
      if (prod) strips.push(this.create(prod, coil, strips.length + 1, f.largura));
    }
    return strips;
  }
}
