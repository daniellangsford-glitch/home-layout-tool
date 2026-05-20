import { Circle } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';

type Props = {
  x: number;
  y: number;
  index: number;
  isSelected: boolean;
  onDragMove: (index: number, x: number, y: number) => void;
  onDragEnd: (index: number, x: number, y: number) => void;
  onClick: (index: number) => void;
};

export function BoundaryHandle({ x, y, index, isSelected, onDragMove, onDragEnd, onClick }: Props) {
  return (
    <Circle
      x={x}
      y={y}
      radius={isSelected ? 7 : 5}
      fill={isSelected ? '#2563eb' : '#ffffff'}
      stroke={isSelected ? '#1d4ed8' : '#3b82f6'}
      strokeWidth={2}
      draggable
      onDragMove={(e: KonvaEventObject<DragEvent>) => {
        onDragMove(index, e.target.x(), e.target.y());
      }}
      onDragEnd={(e: KonvaEventObject<DragEvent>) => {
        onDragEnd(index, e.target.x(), e.target.y());
      }}
      onClick={() => onClick(index)}
      onTap={() => onClick(index)}
    />
  );
}
