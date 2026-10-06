import React, { useEffect, useMemo, useState } from 'react';
import { Search, Wrench } from 'lucide-react';
import { Product } from '../../types/pcp';
import { FerramentalConformacaoService, MAQUINAS_CONFORMACAO } from '../../services/ferramentalConformacaoService';
import { SearchableSelect } from '../SearchableSelect';

// Chave de agrupamento para itens que não constam na aba "Ferramental".
export const SEM_FERRAMENTAL = 'SEM_FERRAMENTAL';

export const ferramentalKey = (p: Product) => FerramentalConformacaoService.resolve(p)?.codigo ?? SEM_FERRAMENTAL;

/** Lista vazia = sem filtro (todos). */
export const inFilter = (filter: string[], v: string) => filter.length === 0 || filter.includes(v);

export interface PlanningFilters {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  familyFilter: string[];
  setFamilyFilter: (v: string[]) => void;
  maquinaFilter: string[];
  setMaquinaFilter: (v: string[]) => void;
  ferramentalFilter: string[];
  setFerramentalFilter: (v: string[]) => void;
  thicknessFilter: string[];
  setThicknessFilter: (v: string[]) => void;
  itemFilter: string[];
  setItemFilter: (v: string[]) => void;
  maquinaOptions: string[];
  ferramentalOptions: { codigo: string; nome: string }[];
  thicknessOptions: number[];
  itemOptions: Product[];
  /** Algum dos produtos atende a cada filtro de produto (família, máquina, ferramental, item). */
  matchesProducts: (products: Product[]) => boolean;
  matchesThickness: (espessura: number) => boolean;
}

/**
 * Filtros do Planejamento Slitter, compartilhados entre a visão por demanda e
 * a de combinações otimizadas. Cascata: Família -> Máquina -> Ferramental ->
 * Bitola -> Item — cada filtro só oferece opções compatíveis com os anteriores.
 */
export function usePlanningFilters(products: Product[]): PlanningFilters {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [familyFilter, setFamilyFilter] = useState<string[]>([]);
  const [maquinaFilter, setMaquinaFilter] = useState<string[]>([]);
  const [ferramentalFilter, setFerramentalFilter] = useState<string[]>([]);
  const [thicknessFilter, setThicknessFilter] = useState<string[]>([]);
  const [itemFilter, setItemFilter] = useState<string[]>([]);

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

  const matchesProducts = (list: Product[]) => {
    const some = (filter: string[], key: (p: Product) => string) =>
      filter.length === 0 || list.some(p => filter.includes(key(p)));
    return some(familyFilter, p => p.familia) &&
      some(maquinaFilter, p => FerramentalConformacaoService.maquina(p)) &&
      some(ferramentalFilter, ferramentalKey) &&
      some(itemFilter, p => p.codigo);
  };

  const matchesThickness = (espessura: number) => inFilter(thicknessFilter, String(espessura));

  return {
    searchQuery, setSearchQuery,
    familyFilter, setFamilyFilter,
    maquinaFilter, setMaquinaFilter,
    ferramentalFilter, setFerramentalFilter,
    thicknessFilter, setThicknessFilter,
    itemFilter, setItemFilter,
    maquinaOptions, ferramentalOptions, thicknessOptions, itemOptions,
    matchesProducts, matchesThickness
  };
}

export interface FerramentalGroup<T> {
  codigo: string; // 'COMPLEMENTAR' = bloco de itens que só entram como fita complementar
  nome: string;
  demandaT: number; // demanda total do ferramental, todas as espessuras
  entries: T[];
}

/**
 * Agrupa entradas (combinações de corte ou cards de demanda) pelo ferramental
 * de conformação do produto principal. Com ferramental/máquina filtrados,
 * entradas puxadas por OUTRO ferramental — onde o filtrado só entra como fita
 * complementar — vão para um bloco à parte no fim, em vez de abrir
 * cabeçalhos de ferramentais não pedidos.
 */
export function groupByFerramental<T>(
  entries: T[],
  mainProductOf: (entry: T) => Product,
  products: Product[],
  filters: Pick<PlanningFilters, 'ferramentalFilter' | 'maquinaFilter' | 'ferramentalOptions'>
): FerramentalGroup<T>[] {
  const { ferramentalFilter, maquinaFilter, ferramentalOptions } = filters;

  const demandaPorFerramental = new Map<string, number>();
  products.forEach(p => {
    const k = ferramentalKey(p);
    demandaPorFerramental.set(k, (demandaPorFerramental.get(k) || 0) + (p.demandaT || 0));
  });

  const groups = new Map<string, { codigo: string; nome: string; entries: T[] }>();
  const complementares: T[] = [];
  entries.forEach(entry => {
    const main = mainProductOf(entry);
    const f = FerramentalConformacaoService.resolve(main);
    const codigo = f?.codigo ?? SEM_FERRAMENTAL;
    const foraDoFiltro =
      !inFilter(ferramentalFilter, codigo) ||
      !inFilter(maquinaFilter, FerramentalConformacaoService.maquina(main));
    if (foraDoFiltro) {
      complementares.push(entry);
      return;
    }
    if (!groups.has(codigo)) groups.set(codigo, { codigo, nome: f?.nome ?? 'Sem ferramental mapeado', entries: [] });
    groups.get(codigo)!.entries.push(entry);
  });

  const ordered: FerramentalGroup<T>[] = Array.from(groups.values())
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
      nome: `Outros que também produzem itens de ${alvo} (como fita complementar)`,
      entries: complementares,
      demandaT: Number(products
        .filter(p => inFilter(ferramentalFilter, ferramentalKey(p)) && inFilter(maquinaFilter, FerramentalConformacaoService.maquina(p)))
        .reduce((acc, p) => acc + (p.demandaT || 0), 0)
        .toFixed(2))
    });
  }
  return ordered;
}

export const FerramentalGroupHeader: React.FC<{ nome: string; demandaT: number; countLabel: string }> = ({ nome, demandaT, countLabel }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#0B1F3A] text-white">
    <div className="flex items-center gap-2">
      <Wrench className="w-4 h-4 text-orange-400" />
      <span className="text-sm font-black">{nome}</span>
    </div>
    <div className="flex items-center gap-3 text-xs">
      <span>Demanda do ferramental: <strong className="font-black text-orange-300">{demandaT} t</strong></span>
      <span className="text-white/60">{countLabel}</span>
    </div>
  </div>
);

interface PlanningFilterBarProps {
  filters: PlanningFilters;
  children?: React.ReactNode; // controles específicos da visão (ex: status, refilo)
}

export const PlanningFilterBar: React.FC<PlanningFilterBarProps> = ({ filters, children }) => (
  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-56">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código ou slitter..."
          value={filters.searchQuery}
          onChange={(e) => filters.setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A]"
        />
      </div>

      <SearchableSelect
        values={filters.familyFilter}
        onChange={filters.setFamilyFilter}
        allLabel="Todas as Famílias"
        options={[{ value: 'TUBO', label: 'TUBO' }, { value: 'PERFIL', label: 'PERFIL' }]}
        className="w-48"
      />

      <SearchableSelect
        values={filters.maquinaFilter}
        onChange={filters.setMaquinaFilter}
        allLabel="Todas as Máquinas"
        options={filters.maquinaOptions.map(m => ({ value: m, label: m }))}
        className="w-52"
      />

      <SearchableSelect
        values={filters.ferramentalFilter}
        onChange={filters.setFerramentalFilter}
        allLabel="Todos os Ferramentais"
        options={filters.ferramentalOptions.map(f => ({ value: f.codigo, label: f.nome }))}
        className="w-72"
      />

      <SearchableSelect
        values={filters.thicknessFilter}
        onChange={filters.setThicknessFilter}
        allLabel="Todas as Bitolas"
        options={filters.thicknessOptions.map(t => ({ value: String(t), label: `${t} mm` }))}
        className="w-40"
      />

      <SearchableSelect
        values={filters.itemFilter}
        onChange={filters.setItemFilter}
        allLabel="Todos os Itens"
        options={filters.itemOptions.map(p => ({ value: p.codigo, label: `${p.codigo} — ${p.descricao}` }))}
        className="w-72"
      />

      {children}
    </div>
  </div>
);
