import React, { useState } from 'react';
import { ExcessItem } from '../services/demandExcessService';
import { AlertTriangle, ShieldCheck, Undo2 } from 'lucide-react';

interface ExcessAuthorizationPanelProps {
  items: ExcessItem[];
  authorizedBy: string | null;
  onAuthorize: (nome: string) => void;
  onRevoke: () => void;
}

/** Bloqueio de produção acima da demanda: só segue com autorização nominal de quem confere o plano. */
export const ExcessAuthorizationPanel: React.FC<ExcessAuthorizationPanelProps> = ({
  items,
  authorizedBy,
  onAuthorize,
  onRevoke
}) => {
  const [nome, setNome] = useState('');

  if (items.length === 0) return null;

  return (
    <div className={`p-4 rounded-2xl border space-y-3 print:hidden ${
      authorizedBy ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-300'
    }`}>
      <div className={`flex items-center gap-2 text-xs font-black ${authorizedBy ? 'text-emerald-900' : 'text-amber-900'}`}>
        {authorizedBy ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
        {authorizedBy
          ? `Produção acima da demanda autorizada por ${authorizedBy}`
          : 'Este plano produz acima da demanda — precisa de autorização para seguir'}
      </div>

      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="text-left uppercase text-[10px] text-slate-500">
            <th className="py-1">Item</th>
            <th className="py-1 text-right">Demanda</th>
            <th className="py-1 text-right">Produzido</th>
            <th className="py-1 text-right">Excedente</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {items.map(i => (
            <tr key={i.productId}>
              <td className="py-1 font-bold text-slate-900">{i.codigo}</td>
              <td className="py-1 text-right">{i.demandaT} t</td>
              <td className="py-1 text-right">{i.producedT} t</td>
              <td className="py-1 text-right font-black text-red-700">+{i.excessT} t</td>
            </tr>
          ))}
        </tbody>
      </table>

      {authorizedBy ? (
        <button
          onClick={onRevoke}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900"
        >
          <Undo2 className="w-3.5 h-3.5" /> Revogar autorização
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome de quem autoriza (operador / supervisor)"
            className="flex-1 min-w-[240px] px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={() => nome.trim() && onAuthorize(nome.trim())}
            disabled={!nome.trim()}
            className="px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#163866] text-white text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Autorizar excedente
          </button>
        </div>
      )}
    </div>
  );
};
