import React from 'react';
import { Rect, Ellipse, Text, Group } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { LayoutObject } from '../../types/layoutObject';
import { toPixels, toUnits, snapToGrid } from '../../lib/scale';

type Props = {
  object: LayoutObject;
  pixelsPerUnit: number;
  gridSize: number;
  snapEnabled: boolean;
  isSelected: boolean;
  onSelect: (id: string, shiftHeld: boolean) => void;
  onUpdate: (id: string, updates: Partial<LayoutObject>) => void;
};

export function LayoutObjectNode({
  object, pixelsPerUnit, gridSize, snapEnabled, isSelected, onSelect, onUpdate,
}: Props) {
  if (!object.visible) return null;

  const x = toPixels(object.x, pixelsPerUnit);
  const y = toPixels(object.y, pixelsPerUnit);
  const w = toPixels(object.width, pixelsPerUnit);
  const h = toPixels(object.height, pixelsPerUnit);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    let newX = toUnits(e.target.x(), pixelsPerUnit);
    let newY = toUnits(e.target.y(), pixelsPerUnit);
    if (snapEnabled && !object.snapDisabled) {
      newX = snapToGrid(newX, gridSize);
      newY = snapToGrid(newY, gridSize);
    }
    onUpdate(object.id, { x: newX, y: newY });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (e: any) => onSelect(object.id, e?.evt?.shiftKey ?? false);

  const shapeStroke = isSelected ? '#2563eb' : object.stroke;
  const shapeStrokeWidth = isSelected ? 2 : object.strokeWidth;
  const labelFontSize = Math.max(10, Math.min(14, w / Math.max(object.name.length, 1) * 1.4));
  const isText = object.shape === 'text';

  return (
    <Group
      id={`obj-${object.id}`}
      x={x} y={y} width={w} height={h}
      draggable={!object.locked}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={() => onSelect(object.id, false)}
      opacity={object.opacity}
    >
      {object.shape === 'rectangle' && (
        <Rect width={w} height={h} fill={object.fill} stroke={shapeStroke} strokeWidth={shapeStrokeWidth} />
      )}
      {(object.shape === 'circle' || object.shape === 'ellipse') && (
        <Ellipse
          x={w / 2} y={h / 2}
          radiusX={w / 2} radiusY={h / 2}
          fill={object.fill} stroke={shapeStroke} strokeWidth={shapeStrokeWidth}
        />
      )}
      {isText && (
        <>
          <Rect width={w} height={h} fill="transparent" stroke={isSelected ? '#2563eb' : 'transparent'} strokeWidth={isSelected ? 1 : 0} dash={[4, 3]} />
          <Text text={object.name} width={w} fontSize={object.fontSize ?? 14} fill={object.fill} wrap="word" listening={false} />
        </>
      )}
      {!isText && w > 20 && h > 12 && object.name && (
        <Text
          text={object.name}
          width={w} height={h}
          align="center" verticalAlign="middle"
          fontSize={labelFontSize}
          fill="#1f2937"
          listening={false}
          wrap="none"
          ellipsis
        />
      )}
    </Group>
  );
}
