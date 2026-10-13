import React, { useEffect, useState } from 'react';

interface CommitNumberInputProps {
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  title?: string;
}

/** Campo numérico que só aplica o valor ao sair do campo ou ao pressionar Enter. */
export const CommitNumberInput: React.FC<CommitNumberInputProps> = ({
  value,
  onCommit,
  min = 0,
  max,
  step = 1,
  suffix,
  className = '',
  title
}) => {
  const [draft, setDraft] = useState<string>(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const n = Number(draft.replace(',', '.'));
    if (!Number.isFinite(n) || n <= min || (max !== undefined && n > max)) {
      setDraft(String(value));
      return;
    }
    if (n !== value) onCommit(Number(n.toFixed(2)));
  };

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        step={step}
        title={title}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') setDraft(String(value));
        }}
        className={`w-20 px-2 py-1 rounded-lg border border-slate-200 bg-white text-right font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500 ${className}`}
      />
      {suffix && <span className="text-slate-500">{suffix}</span>}
    </span>
  );
};
