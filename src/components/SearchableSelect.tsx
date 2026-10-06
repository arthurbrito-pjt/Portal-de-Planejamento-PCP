import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  values: string[]; // vazio = todos
  onChange: (values: string[]) => void;
  options: SearchableSelectOption[];
  allLabel: string;
  className?: string;
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Seleção múltipla com campo de digitação: filtra as opções enquanto o
 * usuário escreve; cada clique (ou Enter) marca/desmarca uma opção sem fechar
 * a lista, para selecionar várias em sequência. Nenhuma marcada = todas.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({ values, onChange, options, allLabel, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(() => new Set(values), [values]);

  const summary = useMemo(() => {
    if (values.length === 0) return '';
    const first = options.find(o => o.value === values[0])?.label ?? values[0];
    return values.length === 1 ? first : `${values.length} selecionados`;
  }, [values, options]);

  const filtered = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return options;
    return options.filter(o => terms.every(t => normalize(o.label).includes(t)));
  }, [query, options]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => setHighlight(0), [query, open]);

  useEffect(() => {
    listRef.current?.querySelectorAll('[data-option]')[highlight]?.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  const toggle = (v: string) => {
    onChange(selected.has(v) ? values.filter(x => x !== v) : [...values, v]);
  };

  const selectAllFiltered = () => {
    const merged = new Set(values);
    filtered.forEach(o => merged.add(o.value));
    onChange(Array.from(merged));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && filtered[highlight]) toggle(filtered[highlight].value);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    } else if (e.key === 'Backspace' && query === '' && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={open ? query : summary}
        placeholder={open && summary ? summary : allLabel}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={onKeyDown}
        title={values.map(v => options.find(o => o.value === v)?.label ?? v).join('\n') || allLabel}
        className={`w-full py-1.5 pl-2.5 pr-12 border rounded-lg text-sm placeholder-slate-500 truncate focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] ${
          values.length > 0 ? 'bg-[#0B1F3A]/5 border-[#0B1F3A]/30 text-[#0B1F3A] font-medium' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
        {values.length > 0 && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange([])}
            className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            title="Limpar filtro"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-[16rem] bg-white border border-slate-200 rounded-lg shadow-lg text-sm">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 text-xs">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={selectAllFiltered}
              className="text-[#0B1F3A] font-semibold hover:underline disabled:opacity-40"
              disabled={filtered.length === 0}
            >
              {query ? `Marcar os ${filtered.length} encontrados` : 'Marcar todos'}
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange([])}
              className="text-slate-500 hover:underline disabled:opacity-40"
              disabled={values.length === 0}
            >
              Limpar ({values.length})
            </button>
          </div>
          <ul ref={listRef} className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-3 py-2 text-slate-400">Nada encontrado</li>}
            {filtered.map((o, i) => {
              const isSelected = selected.has(o.value);
              return (
                <li
                  key={o.value}
                  data-option
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggle(o.value)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer ${i === highlight ? 'bg-[#0B1F3A]/5' : ''} ${
                    isSelected ? 'font-semibold text-[#0B1F3A]' : 'text-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center ${
                    isSelected ? 'bg-[#0B1F3A] border-[#0B1F3A]' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span>{o.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
