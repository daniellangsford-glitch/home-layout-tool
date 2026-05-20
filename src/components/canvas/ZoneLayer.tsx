import React from 'react';
import { Group, Line, Rect, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Zone } from '../../types/zone';
import { ZoneEditor } from './ZoneEditor';
import type { MeasurementUnit } from '../../types/plan';
import { toPixels, toUnits, formatMeasurement } from '../../lib/scale';
import { getPolygonCentroid, getPolygonBounds, getMidpoint, calculateDistance } from '../../lib/geometry';
import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';

type Props = {
  planId: string;
  zones: Zone[];
  pixelsPerUnit: number;
  gridSize: number;
  snapEnabled: boolean;
  isInteractive: boolean;
  showDimensions: boolean;
  unit: MeasurementUnit;
};

export function ZoneLayer({ planId, zones, pixelsPerUnit, gridSize, snapEnabled, isInteractive, showDimensions, unit }: Props) {
  const selectedZoneId = useCanvasStore((s) => s.selectedZoneId);
  const editingZoneId = useCanvasStore((s) => s.editingZoneId);
  const setSelectedZone = useCanvasStore((s) => s.setSelectedZone);
  const updateZone = useProjectStore((s) => s.updateZone);

  return (
    <Group>
      {zones.filter((z) => z.visible).map((zone) => (
        <ZoneNode
          key={zone.id}
          planId={planId}
          zone={zone}
          pixelsPerUnit={pixelsPerUnit}
          gridSize={gridSize}
          snapEnabled={snapEnabled}
          isSelected={selectedZoneId === zone.id}
          isEditing={editingZoneId === zone.id}
          isInteractive={isInteractive}
          showDimensions={showDimensions}
          unit={unit}
          onSelect={() => setSelectedZone(zone.id)}
          onUpdate={(points) => updateZone(planId, zone.id, { points })}
        />
      ))}
    </Group>
  );
}

type ZoneNodeProps = {
  planId: string;
  zone: Zone;
  pixelsPerUnit: number;
  gridSize: number;
  snapEnabled: boolean;
  isSelected: boolean;
  isEditing: boolean;
  isInteractive: boolean;
  showDimensions: boolean;
  unit: MeasurementUnit;
  onSelect: () => void;
  onUpdate: (points: Zone['points']) => void;
};

function ZoneNode({
  planId,
  zone,
  pixelsPerUnit,
  gridSize,
  snapEnabled,
  isSelected,
  isEditing,
  isInteractive,
  showDimensions,
  unit,
  onSelect,
  onUpdate,
}: ZoneNodeProps) {
  const flatPoints = zone.points.flatMap((p) => [
    toPixels(p.x, pixelsPerUnit),
    toPixels(p.y, pixelsPerUnit),
  ]);

  const centroid = getPolygonCentroid(zone.points);
  const cx = toPixels(centroid.x, pixelsPerUnit);
  const cy = toPixels(centroid.y, pixelsPerUnit);

  // Bounding box for transformer target
  const bounds = getPolygonBounds(zone.points);
  const bx = toPixels(bounds.x, pixelsPerUnit);
  const by = toPixels(bounds.y, pixelsPerUnit);
  const bw = toPixels(bounds.width, pixelsPerUnit);
  const bh = toPixels(bounds.height, pixelsPerUnit);

  const handleRectDragEnd = (e: KonvaEventObject<DragEvent>) => {
    // Compute how much the rect moved from its starting position (bx, by)
    const dx = toUnits(e.target.x() - bx, pixelsPerUnit);
    const dy = toUnits(e.target.y() - by, pixelsPerUnit);
    // Reset rect position — react-konva will re-derive it from updated zone points
    e.target.position({ x: bx, y: by });
    onUpdate(zone.points.map((p) => ({ x: p.x + dx, y: p.y + dy })));
  };

  const strokeColor = isSelected || isEditing ? zone.stroke : zone.stroke;
  const strokeWidth = isSelected || isEditing ? 2 : zone.strokeWidth;

  return (
    <Group>
      {/* Zone fill polygon — clickable to select when not already selected */}
      <Line
        points={flatPoints}
        closed
        fill={zone.fill}
        opacity={zone.opacity}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        dash={isEditing ? [6, 3] : undefined}
        listening={isInteractive && !isSelected}
        onClick={isInteractive && !isSelected ? onSelect : undefined}
        onTap={isInteractive && !isSelected ? onSelect : undefined}
        perfectDrawEnabled={false}
      />

      {/* Zone label at centroid */}
      {zone.name && (
        <Text
          x={cx - 60}
          y={cy - 8}
          width={120}
          text={zone.name}
          align="center"
          fontSize={11}
          fill={zone.stroke}
          fontStyle="bold"
          listening={false}
          opacity={isSelected || isEditing ? 1 : 0.85}
        />
      )}

      {/* Selection dashed outline */}
      {(isSelected || isEditing) && (
        <Line
          points={flatPoints}
          closed
          fill="transparent"
          stroke={zone.stroke}
          strokeWidth={isEditing ? 2 : 1.5}
          dash={isEditing ? [6, 3] : [4, 2]}
          listening={false}
          opacity={0.9}
        />
      )}

      {/* Transparent bounding-box Rect — transformer target + drag handle when selected */}
      {isSelected && !isEditing && (
        <Rect
          id={`zone-${zone.id}`}
          x={bx}
          y={by}
          width={bw}
          height={bh}
          fill="transparent"
          stroke="transparent"
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleRectDragEnd}
        />
      )}

      {/* Edge dimension labels */}
      {(showDimensions || (zone.showDimensions ?? false)) && zone.points.map((p, i) => {
        const next = zone.points[(i + 1) % zone.points.length];
        const mid = getMidpoint(p, next);
        const dist = calculateDistance(p, next);
        const centroid = getPolygonCentroid(zone.points);
        const centroidPx = { x: toPixels(centroid.x, pixelsPerUnit), y: toPixels(centroid.y, pixelsPerUnit) };
        const midPx = { x: toPixels(mid.x, pixelsPerUnit), y: toPixels(mid.y, pixelsPerUnit) };
        const dx = midPx.x - centroidPx.x;
        const dy = midPx.y - centroidPx.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const offset = 14;
        return (
          <Text
            key={`zdim-${i}`}
            x={midPx.x + (dx / len) * offset - 24}
            y={midPx.y + (dy / len) * offset - 6}
            width={48} align="center"
            text={formatMeasurement(dist, unit)}
            fontSize={9} fill={zone.stroke}
            listening={false}
          />
        );
      })}

      {/* Polygon corner handles when editing shape */}
      {isEditing && (
        <ZoneEditor
          planId={planId}
          zone={zone}
          pixelsPerUnit={pixelsPerUnit}
          gridSize={gridSize}
          snapEnabled={snapEnabled}
        />
      )}
    </Group>
  );
}
