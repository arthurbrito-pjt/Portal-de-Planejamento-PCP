import React from 'react';
import qrcode from 'qrcode-generator';

interface QRCodeProps {
  value: string;
  size?: number;
}

/**
 * QR code real e decodável (biblioteca qrcode-generator) — as etiquetas físicas
 * de slitter são escaneadas no chão de fábrica, por isso não pode ser um padrão visual falso.
 */
export const QRCodeSVG: React.FC<QRCodeProps> = ({ value, size = 60 }) => {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = size / moduleCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white p-1 rounded-xl shadow-xs border border-slate-300 shrink-0">
      <rect width={size} height={size} fill="white" />
      {Array.from({ length: moduleCount }).map((_, r) =>
        Array.from({ length: moduleCount }).map((_, c) =>
          qr.isDark(r, c) ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.1}
              height={cellSize + 0.1}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
};
