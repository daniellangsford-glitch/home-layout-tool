import React from 'react';
import { Group, Circle } from 'react-konva';
import type { Zone } from '../../types/zone';
import { BoundaryHandle } from './BoundaryHandle';
import { toPixels, toUnits, snapToGrid } from '../../lib/scale';
import { getMidpoint } from '../../lib/geometry';
import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';

type Props = {
  planId: string;
  zone: Zone;
  pixelsPerUnit: number;
  gridSize: number;
  snapEnabled: boolean;
};

export function ZoneEditor({ planId, zone, pixelsPerUnit, gridSize, snapEnabled }: Props) {
  const selectedIndex = useCanvasStore((s) => s.selectedZonePointIndex);
  const setSelectedPoint = useCanvasStore((s) => s.setSelectedZonePoint);
  const moveZonePoint = useProjectStore((s) => s.moveZonePoint);
  const addZonePoint = useProjectStore((s) => s.addZonePoint);

  const { points } = zone;

  const handleDragEnd = (index: number, pxX: number, pxY: number) => {
    let x = toUnits(pxX, pixelsPerUnit);
    let y = toUnits(pxY, pixelsPerUnit);
    if (snapEnabled) {
      x = snapToGrid(x, gridSize);
      y = snapToGrid(y, gridSize);
    }
    moveZonePoint(planId, zone.id, index, { x, y });
  };

  const handleEdgeClick = (edgeIndex: number) => {
    const a = points[edgeIndex];
    const b = points[(edgeIndex + 1) % points.length];
    const mid = getMidpoint(a, b);
    addZonePoint(planId, zone.id, edgeIndex, mid);
  };

  return (
    <Group>
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        const mid = getMidpoint(p, next);
        return (
          <Circle
            key={`edge-${i}`}
            x={toPixels(mid.x, pixelsPerUnit)}
            y={toPixels(mid.y, pixelsPerUnit)}
            radius={4}
            fill={zone.fill}
            stroke={zone.stroke}
            strokeWidth={1}
            opacity={0.8}
            onClick={() => handleEdgeClick(i)}
            onTap={() => handleEdgeClick(i)}
          />
        );
      })}
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
