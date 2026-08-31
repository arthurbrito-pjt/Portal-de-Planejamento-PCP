import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export const QRCodeSVG: React.FC<QRCodeProps> = ({ value, size = 60 }) => {
  const gridCount = 21;
  const modules: boolean[][] = Array.from({ length: gridCount }, () => Array(gridCount).fill(false));

  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          modules[r + i][c + j] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < gridCount; r++) {
    for (let c = 0; c < gridCount; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;
      if (r === 6 || c === 6) {
        modules[r][c] = (r + c) % 2 === 0;
        continue;
      }
      const val = Math.abs(Math.sin(hash + r * 21 + c)) * 10000;
      modules[r][c] = (Math.floor(val) % 2) === 0;
    }
  }

  const cellSize = size / gridCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white p-1 rounded-xl shadow-xs border border-slate-300 shrink-0">
      <rect width={size} height={size} fill="white" />
      {modules.map((row, rIdx) =>
        row.map((cell, cIdx) => (
          cell ? (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx * cellSize}
              y={rIdx * cellSize}
              width={cellSize + 0.1}
              height={cellSize + 0.1}
              fill="#0f172a"
            />
          ) : null
        ))
      )}
    </svg>
  );
};
