import React from 'react';
import { Line } from 'react-konva';
import type { GridSettings } from '../../types/plan';
import { toPixels } from '../../lib/scale';

type Props = {
  width: number;
  height: number;
  grid: GridSettings;
  pixelsPerUnit: number;
};

export function GridLayer({ width, height, grid, pixelsPerUnit }: Props) {
  if (!grid.visible) return null;

  const lines: React.ReactElement[] = [];
  const gridPx = toPixels(grid.size, pixelsPerUnit);
  const majorEvery = grid.majorLineEvery;

  const cols = Math.floor(width / gridPx);
  const rows = Math.floor(height / gridPx);

  const gridOpacity = grid.opacity ?? 1;

  for (let i = 0; i <= cols; i++) {
    const x = i * gridPx;
    const isMajor = i % majorEvery === 0;
    lines.push(
      <Line
        key={`v-${i}`}
        points={[x, 0, x, height]}
        stroke={isMajor ? '#9ca3af' : '#d1d5db'}
        strokeWidth={isMajor ? 0.75 : 0.5}
        opacity={gridOpacity}
        listening={false}
      />
    );
  }

  for (let i = 0; i <= rows; i++) {
    const y = i * gridPx;
    const isMajor = i % majorEvery === 0;
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, y, width, y]}
        stroke={isMajor ? '#9ca3af' : '#d1d5db'}
        strokeWidth={isMajor ? 0.75 : 0.5}
        opacity={gridOpacity}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}
