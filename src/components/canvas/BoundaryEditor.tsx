import React from 'react';
import { Group, Line, Circle } from 'react-konva';
import type { PlanBoundary } from '../../types/plan';
import { BoundaryHandle } from './BoundaryHandle';
import { toPixels, toUnits, snapToGrid } from '../../lib/scale';
import { getMidpoint } from '../../lib/geometry';
import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';

type Props = {
  planId: string;
  boundary: PlanBoundary;
  pixelsPerUnit: number;
  gridSize: number;
  snapEnabled: boolean;
};

export function BoundaryEditor({ planId, boundary, pixelsPerUnit, gridSize, snapEnabled }: Props) {
  const selectedIndex = useCanvasStore((s) => s.selectedBoundaryPointIndex);
  const setSelectedPoint = useCanvasStore((s) => s.setSelectedBoundaryPoint);
  const moveBoundaryPoint = useProjectStore((s) => s.moveBoundaryPoint);
  const addBoundaryPoint = useProjectStore((s) => s.addBoundaryPoint);

  const points = boundary.points;

  const handleDragEnd = (index: number, pxX: number, pxY: number) => {
    let x = toUnits(pxX, pixelsPerUnit);
    let y = toUnits(pxY, pixelsPerUnit);
    if (snapEnabled) {
      x = snapToGrid(x, gridSize);
      y = snapToGrid(y, gridSize);
    }
    moveBoundaryPoint(planId, index, { x, y });
  };

  const handleEdgeClick = (edgeIndex: number) => {
    const a = points[edgeIndex];
    const b = points[(edgeIndex + 1) % points.length];
    const mid = getMidpoint(a, b);
    addBoundaryPoint(planId, edgeIndex, mid);
  };

  return (
    <Group>
      {/* Edge midpoint insert handles */}
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        const mid = getMidpoint(p, next);
        return (
          <Circle
            key={`edge-${i}`}
            x={toPixels(mid.x, pixelsPerUnit)}
            y={toPixels(mid.y, pixelsPerUnit)}
            radius={4}
            fill="#93c5fd"
            stroke="#3b82f6"
            strokeWidth={1}
            opacity={0.7}
            onClick={() => handleEdgeClick(i)}
            onTap={() => handleEdgeClick(i)}
          />
        );
      })}
      {/* Corner handles */}
      {points.map((p, i) => (
        <BoundaryHandle
          key={`pt-${i}`}
          index={i}
          x={toPixels(p.x, pixelsPerUnit)}
          y={toPixels(p.y, pixelsPerUnit)}
          isSelected={selectedIndex === i}
          onDragMove={() => {}}
          onDragEnd={handleDragEnd}
          onClick={setSelectedPoint}
        />
      ))}
    </Group>
  );
}
