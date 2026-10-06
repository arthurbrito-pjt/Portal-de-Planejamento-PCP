import React, { useEffect, useMemo, useState } from 'react';
import { Coil, Product, SlitterIntermediaryItem } from '../../types/pcp';
import { Disc, Scissors, Layers, Boxes, CheckCircle2, ChevronDown, ChevronUp, Search, Gauge, Wrench } from 'lucide-react';
import { ReadinessService, SlitterProductionProgram } from '../../services/readinessService';
import { StorageService } from '../../services/storageService';
import { FerramentalConformacaoService, MAQUINAS_CONFORMACAO } from '../../services/ferramentalConformacaoService';
import { MetricsBadge } from '../../components/MetricsBadge';
import { SearchableSelect } from '../../components/SearchableSelect';

type ScrapFilter = 'TODOS' | 'IDEAL' | 'ALTO';

// Chave de agrupamento para itens que não constam na aba "Ferramental".
const SEM_FERRAMENTAL = 'SEM_FERRAMENTAL';

const ferramentalKey = (p: Product) => FerramentalConformacaoService.resolve(p)?.codigo ?? SEM_FERRAMENTAL;


interface ProgramasSlitterProps {
  products: Product[];
  coils: Coil[];
  intermediarySlitters?: SlitterIntermediaryItem[];
  onOpenProgramSimulation: (program: SlitterProductionProgram) => void;
  onOpenProgramOrder: (program: SlitterProductionProgram) => void;
}

export const ProgramasSlitter: React.FC<ProgramasSlitterProps> = ({
  products,
  coils,
  intermediarySlitters = [],
  onOpenProgramSimulation,
  onOpenProgramOrder
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Filtros de seleção múltipla: lista vazia = sem filtro (todos).
  const [familyFilter, setFamilyFilter] = useState<string[]>([]);
  const [maquinaFilter, setMaquinaFilter] = useState<string[]>([]);
  const [ferramentalFilter, setFerramentalFilter] = useState<string[]>([]);
  const [thicknessFilter, setThicknessFilter] = useState<string[]>([]);
  const [itemFilter, setItemFilter] = useState<string[]>([]);
  const [scrapFilter, setScrapFilter] = useState<ScrapFilter>('TODOS');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const produtividadeByFerramental = useMemo(() => {
    const map = new Map<string, number>();
    StorageService.getFerramentalProdutividade().forEach(p => map.set(p.codigoFerramental, p.tonPorHora));
    return map;
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const slitterPrograms = useMemo(
    () => ReadinessService.generateSlitterPrograms(products, coils, intermediarySlitters),
    [products, coils, intermediarySlitters]
  );

  // Filtros em cascata: Família -> Máquina -> Ferramental -> Bitola -> Item.
  // Cada filtro só oferece opções compatíveis com o que já foi escolhido antes.
  const inFilter = (filter: string[], v: string) => filter.length === 0 || filter.includes(v);

  const productsByFamily = useMemo(
    () => products.filter(p => inFilter(familyFilter, p.familia)),
    [products, familyFilter]
  );

  const maquinaOptions = useMemo(() => {
    const presentes = new Set(productsByFamily.map(p => FerramentalConformacaoService.maquina(p)));
    return MAQUINAS_CONFORMACAO.filter(m => presentes.has(m));
  }, [productsByFamily]);

  const productsByMaquina = useMemo(
    () => productsByFamily.filter(p => inFilter(maquinaFilter, FerramentalConformacaoService.maquina(p))),
    [productsByFamily, maquinaFilter]
  );

  const ferramentalOptions = useMemo(() => {
    const map = new Map<string, string>();
    let temSemFerramental = false;
    productsByMaquina.forEach(p => {
      const f = FerramentalConformacaoService.resolve(p);
      if (f) map.set(f.codigo, f.nome);
      else temSemFerramental = true;
    });
    const opts = Array.from(map.entries())
      .map(([codigo, nome]) => ({ codigo, nome }))
      .sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR', { numeric: true }));
    if (temSemFerramental) opts.push({ codigo: SEM_FERRAMENTAL, nome: 'Sem ferramental mapeado' });
    return opts;
  }, [productsByMaquina]);

  const productsByFerramental = useMemo(
    () => productsByMaquina.filter(p => inFilter(ferramentalFilter, ferramentalKey(p))),
    [productsByMaquina, ferramentalFilter]
  );

  const thicknessOptions = useMemo(() => {
    const set = new Set<number>();
    productsByFerramental.forEach(p => set.add(p.espessura));
    return Array.from(set).sort((x, y) => x - y);
  }, [productsByFerramental]);

  const itemOptions = useMemo(() => {
    return productsByFerramental
      .filter(p => inFilter(thicknessFilter, String(p.espessura)))
      .slice()
      .sort((x, y) => x.codigo.localeCompare(y.codigo));
  }, [productsByFerramental, thicknessFilter]);

  // Quando um filtro anterior muda, descarta as seleções que deixaram de
  // existir nas opções (ex: trocou de máquina -> some o ferramental da outra).
  const prune = (filter: string[], valid: string[], set: (v: string[]) => void) => {
    const kept = filter.filter(v => valid.includes(v));
    if (kept.length !== filter.length) set(kept);
  };
  useEffect(() => prune(maquinaFilter, maquinaOptions, setMaquinaFilter), [maquinaOptions, maquinaFilter]);
  useEffect(() => prune(ferramentalFilter, ferramentalOptions.map(f => f.codigo), setFerramentalFilter), [ferramentalOptions, ferramentalFilter]);
  useEffect(() => prune(thicknessFilter, thicknessOptions.map(String), setThicknessFilter), [thicknessOptions, thicknessFilter]);
  useEffect(() => prune(itemFilter, itemOptions.map(p => p.codigo), setItemFilter), [itemOptions, itemFilter]);

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const some = (prog: SlitterProductionProgram, filter: string[], key: (p: Product) => string) =>
      filter.length === 0 || prog.materialsProduced.some(m => filter.includes(key(m.product)));

    return slitterPrograms.filter(prog => {
      const matchesSearch = !q ||
        prog.coil.lote.toLowerCase().includes(q) ||
        prog.coil.codigo.toLowerCase().includes(q) ||
        prog.materialsProduced.some(m =>
          m.codigoSlitter.toLowerCase().includes(q) ||
          m.nomeSlitter.toLowerCase().includes(q) ||
          m.product.codigo.toLowerCase().includes(q)
        );

      const matchesScrap =
        scrapFilter === 'TODOS' ||
        (scrapFilter === 'IDEAL' && prog.sobraMm >= 10 && prog.sobraMm <= 18) ||
        (scrapFilter === 'ALTO' && prog.sobraMm > 18);

      return matchesSearch &&
        some(prog, familyFilter, p => p.familia) &&
        some(prog, maquinaFilter, p => FerramentalConformacaoService.maquina(p)) &&
        some(prog, ferramentalFilter, ferramentalKey) &&
        inFilter(thicknessFilter, String(prog.coil.espessura)) &&
        some(prog, itemFilter, p => p.codigo) &&
        matchesScrap;
    });
  }, [slitterPrograms, searchQuery, familyFilter, maquinaFilter, ferramentalFilter, thicknessFilter, itemFilter, scrapFilter]);

  // Agrupa as combinações pelo ferramental de conformação do produto
  // principal, com a demanda total (todas as espessuras) de cada ferramental.
  const groupedPrograms = useMemo(() => {
    const demandaPorFerramental = new Map<string, number>();
    products.forEach(p => {
      const k = ferramentalKey(p);
      demandaPorFerramental.set(k, (demandaPorFerramental.get(k) || 0) + (p.demandaT || 0));
    });

    const groups = new Map<string, { codigo: string; nome: string; programs: SlitterProductionProgram[] }>();
    const complementares: SlitterProductionProgram[] = [];
    filteredPrograms.forEach(prog => {
      const f = FerramentalConformacaoService.resolve(prog.mainProduct);
      const codigo = f?.codigo ?? SEM_FERRAMENTAL;
      // Com ferramental/máquina filtrados, combinações puxadas por OUTRO
      // ferramental (onde o filtrado só entra como fita complementar) ficam
      // num bloco à parte, em vez de abrir cabeçalhos não pedidos.
      const foraDoFiltro =
        !inFilter(ferramentalFilter, codigo) ||
        !inFilter(maquinaFilter, FerramentalConformacaoService.maquina(prog.mainProduct));
      if (foraDoFiltro) {
        complementares.push(prog);
        return;
      }
      if (!groups.has(codigo)) groups.set(codigo, { codigo, nome: f?.nome ?? 'Sem ferramental mapeado', programs: [] });
      groups.get(codigo)!.programs.push(prog);
    });

    const ordered = Array.from(groups.values())
      .map(g => ({ ...g, demandaT: Number((demandaPorFerramental.get(g.codigo) || 0).toFixed(2)) }))
      .sort((x, y) => {
        if (x.codigo === SEM_FERRAMENTAL) return 1;
        if (y.codigo === SEM_FERRAMENTAL) return -1;
        return y.demandaT - x.demandaT;
      });

    if (complementares.length > 0) {
      const alvo = ferramentalFilter.length > 0
        ? ferramentalFilter.map(c => ferramentalOptions.find(f => f.codigo === c)?.nome ?? c).join(', ')
        : maquinaFilter.join(', ');
      ordered.push({
        codigo: 'COMPLEMENTAR',
        nome: `Outras combinações que também produzem itens de ${alvo} (como fita complementar)`,
        programs: complementares,
        demandaT: Number(products
          .filter(p => inFilter(ferramentalFilter, ferramentalKey(p)) && inFilter(maquinaFilter, FerramentalConformacaoService.maquina(p)))
          .reduce((acc, p) => acc + (p.demandaT || 0), 0)
          .toFixed(2))
      });
    }
    return ordered;
  }, [filteredPrograms, products, ferramentalFilter, ferramentalOptions, maquinaFilter]);

  return (
    <div className="space-y-3">
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código ou slitter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
            />
          </div>

          <SearchableSelect
            values={familyFilter}
            onChange={setFamilyFilter}
            allLabel="Todas as Famílias"
            options={[{ value: 'TUBO', label: 'TUBO' }, { value: 'PERFIL', label: 'PERFIL' }]}
            className="w-48"
          />

          <SearchableSelect
            values={maquinaFilter}
            onChange={setMaquinaFilter}
            allLabel="Todas as Máquinas"
            options={maquinaOptions.map(m => ({ value: m, label: m }))}
            className="w-52"
          />

          <SearchableSelect
            values={ferramentalFilter}
            onChange={setFerramentalFilter}
            allLabel="Todos os Ferramentais"
            options={ferramentalOptions.map(f => ({ value: f.codigo, label: f.nome }))}
            className="w-72"
          />

          <SearchableSelect
            values={thicknessFilter}
            onChange={setThicknessFilter}
            allLabel="Todas as Bitolas"
            options={thicknessOptions.map(t => ({ value: String(t), label: `${t} mm` }))}
            className="w-40"
          />

          <SearchableSelect
            values={itemFilter}
            onChange={setItemFilter}
            allLabel="Todos os Itens"
            options={itemOptions.map(p => ({ value: p.codigo, label: `${p.codigo} — ${p.descricao}` }))}
            className="w-72"
          />

          <div className="flex rounded-lg bg-slate-100 p-1">
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'IDEAL', label: 'Conforme (10-18mm)' },
              { id: 'ALTO', label: 'Sobra > 18mm' }
            ].map(y => (
              <button
                key={y.id}
                onClick={() => setScrapFilter(y.id as ScrapFilter)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  scrapFilter === y.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {y.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Exibindo <strong className="font-medium text-slate-700">{filteredPrograms.length}</strong> combinações de corte em <strong className="font-medium text-slate-700">{groupedPrograms.filter(g => g.codigo !== 'COMPLEMENTAR').length}</strong> ferramentais</span>
        <span className="text-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Regra PCP: refilo padrão de 10 a 18 mm (~1,5%)
        </span>
      </div>

      <div className="space-y-5">
        {groupedPrograms.map(group => (
        <section key={group.codigo} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#0B1F3A] text-white">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-black">{group.nome}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span>Demanda do ferramental: <strong className="font-black text-orange-300">{group.demandaT} t</strong></span>
              <span className="text-white/60">{group.programs.length} {group.programs.length === 1 ? 'combinação' : 'combinações'}</span>
            </div>
          </div>
        {group.programs.map((prog, idx) => {
          const coil = prog.coil;
          const isIdeal = prog.sobraMm >= 10 && prog.sobraMm <= 18;
          const mainMaterial = prog.materialsProduced.find(m => m.finalidade === 'PRINCIPAL');
          const capacidadeTonHora = mainMaterial ? produtividadeByFerramental.get(mainMaterial.codigoSlitter) : undefined;

          return (
            <div key={prog.id || idx} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
                    <Disc className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Bobina Matriz</span>
                      <span className="text-sm font-black text-slate-900 font-mono">Lote: {coil.lote}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold">{coil.codigo}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 font-mono font-bold">{coil.largura} x {coil.espessura} mm</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Estoque de matéria-prima: <strong className="text-emerald-700 font-bold">{coil.peso} t</strong> disponível
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right pr-2">
                    <div className="text-xs text-slate-400 font-bold">Aproveitamento Slitter</div>
                    <div className={`text-sm font-black ${isIdeal ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {prog.aproveitamentoPercent}% ({prog.sobraMm}mm refilo)
                    </div>
                    {!!capacidadeTonHora && (
                      <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                        <Gauge className="w-3 h-3" /> {capacidadeTonHora.toFixed(2)} t/h
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenProgramSimulation(prog)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Simular Slitter</span>
                  </button>

                  <button
                    onClick={() => onOpenProgramOrder(prog)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-black rounded-lg shadow-sm shadow-orange-500/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Emitir OP</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex flex-wrap justify-between gap-1.5 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Scissors className="w-3.5 h-3.5 text-orange-600" />
                    Produção no slitter — montagem de facas ({prog.totalFitas} fitas):
                  </span>
                  <span className="font-mono font-bold text-slate-700 text-[11px]">
                    {prog.materialsProduced.map(m => `${m.quantidadeFitas}x fita ${m.fitaLargura}mm`).join(' + ')}
                    {prog.sobraMm > 0 ? ` + [${prog.sobraMm}mm refilo]` : ''} = {coil.largura}mm
                  </span>
                </div>

                <div className="w-full h-11 bg-slate-200 rounded-lg p-1 flex items-stretch overflow-hidden">
                  {prog.materialsProduced.map((m, mIdx) => {
                    const widthPct = (m.larguraTotal / coil.largura) * 100;
                    const isMain = m.finalidade === 'PRINCIPAL';

                    return (
                      <div
                        key={mIdx}
                        style={{ width: `${widthPct}%` }}
                        className={`h-full flex items-center justify-between px-3 text-white font-mono text-xs font-bold border-r-2 border-white rounded-md transition-colors ${
                          isMain ? 'bg-[#0B1F3A] hover:bg-[#163866]' : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                        title={`${m.quantidadeFitas}x ${m.codigoSlitter} - ${m.nomeSlitter} (${m.fitaLargura}mm)`}
                      >
                        <span className="truncate">{m.quantidadeFitas}x {m.codigoSlitter} ({m.fitaLargura}mm)</span>
                        <span className="text-[11px] opacity-90 shrink-0 ml-1 bg-black/30 px-1.5 py-0.5 rounded font-bold">{m.pesoAlocadoTon}t</span>
                      </div>
                    );
                  })}

                  {prog.sobraMm > 0 && (
                    <div
                      style={{ width: `${(prog.sobraMm / coil.largura) * 100}%` }}
                      className={`h-full border border-dashed text-[11px] font-mono font-medium flex items-center justify-center px-1 rounded-md ${
                        isIdeal ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : prog.sobraMm < 10 ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-red-100 border-red-400 text-red-800'
                      }`}
                    >
                      {prog.sobraMm}mm refilo
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleExpanded(prog.id || String(idx))}
                  className="w-full text-xs font-medium text-slate-600 flex flex-wrap items-center justify-between gap-1 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#0B1F3A]" />
                    Fitas de slitter produzidas & materiais de destino ({prog.materialsProduced.length})
                  </span>
                  {expandedIds.has(prog.id || String(idx)) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {!expandedIds.has(prog.id || String(idx)) && (
                  <div className="flex flex-wrap gap-1.5">
                    {prog.materialsProduced.map((mat, matIdx) => (
                      <span
                        key={matIdx}
                        className={`text-[11px] font-mono px-2 py-1 rounded-md ${mat.finalidade === 'PRINCIPAL' ? 'bg-[#0B1F3A]/10 text-[#0B1F3A] font-bold' : 'bg-orange-50 text-orange-800 font-bold border border-orange-200'}`}
                      >
                        {mat.quantidadeFitas}x {mat.codigoSlitter} → {mat.product.codigo} ({mat.pesoAlocadoTon}t)
                      </span>
                    ))}
                  </div>
                )}

                {expandedIds.has(prog.id || String(idx)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {prog.materialsProduced.map((mat, matIdx) => {
                    const isMain = mat.finalidade === 'PRINCIPAL';
                    return (
                      <div key={matIdx} className={`p-3.5 rounded-lg border space-y-3 ${isMain ? 'bg-[#0B1F3A]/5 border-[#0B1F3A]/20' : 'bg-orange-50/60 border-orange-200'}`}>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            <Scissors className="w-3 h-3 text-orange-500" />
                            Slitter a produzir
                          </span>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-sm font-black font-mono text-[#0B1F3A]">{mat.codigoSlitter}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isMain ? 'bg-[#0B1F3A]/10 text-[#0B1F3A]' : 'bg-orange-100 text-orange-800'}`}>
                              {mat.finalidade}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 font-medium">{mat.nomeSlitter}</p>
                          {!mat.ferramentalCadastrado && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                              Ferramental não cadastrado
                            </span>
                          )}
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            Fita: <span className="text-slate-700 font-bold">{mat.fitaLargura} x {coil.espessura} mm</span>
                          </div>
                        </div>

                        <div className="bg-white/70 p-3 rounded-lg border border-slate-200/70">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            <Boxes className="w-3 h-3" />
                            Material de destino
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-slate-800 font-mono">{mat.product.codigo}</span>
                            <MetricsBadge type="familia" value={mat.product.familia} size="sm" />
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">{mat.product.descricao}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/80 text-xs">
                          <div className="text-center bg-white p-2 rounded-lg border border-slate-200/60">
                            <span className="text-slate-400 block text-[10px]">Qtd rolos</span>
                            <strong className="text-slate-800 font-black font-mono">{mat.quantidadeFitas}x</strong>
                          </div>
                          <div className="text-center bg-white p-2 rounded-lg border border-slate-200/60">
                            <span className="text-slate-400 block text-[10px]">Peso total</span>
                            <strong className="text-emerald-700 font-black font-mono">{mat.pesoAlocadoTon} t</strong>
                          </div>
                          <div className="text-center bg-white p-2 rounded-lg border border-slate-200/60">
                            <span className="text-slate-400 block text-[10px]">Metragem</span>
                            <strong className="text-[#0B1F3A] font-black font-mono">{mat.metrosEstimados} m</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            </div>
          );
        })}
        </section>
        ))}
      </div>
    </div>
  );
};
