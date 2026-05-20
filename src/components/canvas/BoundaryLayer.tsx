import { Line, Rect, Text } from 'react-konva';
import type { PlanBoundary, MeasurementUnit } from '../../types/plan';
import { toPixels, formatMeasurement } from '../../lib/scale';
import { getMidpoint, calculateDistance, getPolygonCentroid } from '../../lib/geometry';

type Props = {
  boundary: PlanBoundary;
  planWidth: number;
  planHeight: number;
  pixelsPerUnit: number;
  isEditMode: boolean;
  showDimensions: boolean;
  unit: MeasurementUnit;
};

export function BoundaryLayer({ boundary, planWidth, planHeight, pixelsPerUnit, isEditMode, showDimensions, unit }: Props) {
  const flatPoints = boundary.points.flatMap((p) => [
    toPixels(p.x, pixelsPerUnit),
    toPixels(p.y, pixelsPerUnit),
  ]);

  const w = toPixels(planWidth, pixelsPerUnit);
  const h = toPixels(planHeight, pixelsPerUnit);

  const centroid = getPolygonCentroid(boundary.points);
  const centroidPx = {
    x: toPixels(centroid.x, pixelsPerUnit),
    y: toPixels(centroid.y, pixelsPerUnit),
  };

  return (
    <>
      <Rect x={0} y={0} width={w} height={h} fill="transparent" stroke="#d1d5db" strokeWidth={1} dash={[6, 4]} listening={false} />
      <Line
        points={flatPoints}
        closed
        fill={isEditMode ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.9)'}
        stroke={isEditMode ? '#3b82f6' : '#374151'}
        strokeWidth={isEditMode ? 2 : 1.5}
        listening={false}
      />
      {showDimensions && boundary.points.map((p, i) => {
        const next = boundary.points[(i + 1) % boundary.points.length];
        const mid = getMidpoint(p, next);
        const dist = calculateDistance(p, next);
        const midPx = { x: toPixels(mid.x, pixelsPerUnit), y: toPixels(mid.y, pixelsPerUnit) };
        // Offset label outward from centroid
        const dx = midPx.x - centroidPx.x;
        const dy = midPx.y - centroidPx.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const offset = 14;
        const lx = midPx.x + (dx / len) * offset;
        const ly = midPx.y + (dy / len) * offset;
        return (
          <Text
            key={`bdim-${i}`}
            x={lx - 28} y={ly - 6}
            width={56} align="center"
            text={formatMeasurement(dist, unit)}
            fontSize={9} fill="#6b7280"
            listening={false}
          />
        );
      })}
    </>
  );
}
