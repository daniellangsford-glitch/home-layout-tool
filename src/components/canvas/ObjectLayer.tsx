import { Group, Text } from 'react-konva';
import type { LayoutObject } from '../../types/layoutObject';
import type { MeasurementUnit } from '../../types/plan';
import { LayoutObjectNode } from './LayoutObjectNode';
import { toPixels, formatMeasurement } from '../../lib/scale';

type Props = {
  objects: LayoutObject[];
  pixelsPerUnit: number;
  gridSize: number;
  snapEnabled: boolean;
  showDimensions: boolean;
  unit: MeasurementUnit;
  selectedIds: string[];
  onSelect: (id: string, shiftHeld: boolean) => void;
  onUpdate: (id: string, updates: Partial<LayoutObject>) => void;
};

export function ObjectLayer({ objects, pixelsPerUnit, gridSize, snapEnabled, showDimensions, unit, selectedIds, onSelect, onUpdate }: Props) {
  const sorted = [...objects].sort((a, b) => a.layerIndex - b.layerIndex);

  return (
    <Group>
      {/* Shapes */}
      {sorted.map((obj) => (
        <LayoutObjectNode
          key={obj.id}
          object={obj}
          pixelsPerUnit={pixelsPerUnit}
          gridSize={gridSize}
          snapEnabled={snapEnabled}
          isSelected={selectedIds.includes(obj.id)}
          onSelect={onSelect}
          onUpdate={onUpdate}
        />
      ))}

      {/* Dimension labels — separate pass to stay outside the clipped shape Groups */}
      {sorted.map((obj) => {
        if (!obj.visible) return null;
        const show = showDimensions || (obj.showDimensions ?? false);
        if (!show || obj.shape === 'text') return null;

        const x = toPixels(obj.x, pixelsPerUnit);
        const y = toPixels(obj.y, pixelsPerUnit);
        const w = toPixels(obj.width, pixelsPerUnit);
        const h = toPixels(obj.height, pixelsPerUnit);

        if (obj.shape === 'rectangle') {
          return (
            <Group key={`dim-${obj.id}`} listening={false}>
              <Text
                x={x} y={y + h + 4}
                width={w} align="center"
                text={formatMeasurement(obj.width, unit)}
                fontSize={10} fill="#6b7280"
              />
              <Text
                x={x + w + 4} y={y + h / 2 - 5}
                text={formatMeasurement(obj.height, unit)}
                fontSize={10} fill="#6b7280"
              />
            </Group>
          );
        }

        if (obj.shape === 'circle' || obj.shape === 'ellipse') {
          return (
            <Text
              key={`dim-${obj.id}`}
              x={x} y={y + h + 4}
              width={w} align="center"
              text={`⌀ ${formatMeasurement(Math.max(obj.width, obj.height), unit)}`}
              fontSize={10} fill="#6b7280"
              listening={false}
            />
          );
        }

        return null;
      })}
    </Group>
  );
}
