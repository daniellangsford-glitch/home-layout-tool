import { useRef, useEffect } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import type { LayoutObject } from '../../types/layoutObject';
import { toUnits, snapToGrid } from '../../lib/scale';

type Props = {
  selectedIds: string[];
  objects: LayoutObject[];
  stageRef: React.RefObject<Konva.Stage | null>;
  pixelsPerUnit: number;
  gridSize: number;
  snapEnabled: boolean;
  onUpdate: (id: string, updates: Partial<LayoutObject>) => void;
};

export function TransformerControls({ selectedIds, objects, stageRef, pixelsPerUnit, gridSize, snapEnabled, onUpdate }: Props) {
  const transformerRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    if (selectedIds.length === 0) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }
    const nodes = selectedIds
      .map((id) => stageRef.current!.findOne(`#obj-${id}`))
      .filter(Boolean) as Konva.Node[];
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds, stageRef]);

  const handleTransformEnd = () => {
    if (!stageRef.current) return;
    for (const id of selectedIds) {
      const node = stageRef.current.findOne(`#obj-${id}`);
      if (!node) continue;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      const obj = objects.find((o) => o.id === id);
      let newX = toUnits(node.x(), pixelsPerUnit);
      let newY = toUnits(node.y(), pixelsPerUnit);
      let newW = toUnits(node.width() * scaleX, pixelsPerUnit);
      let newH = toUnits(node.height() * scaleY, pixelsPerUnit);
      if (snapEnabled && !obj?.snapDisabled) {
        newX = snapToGrid(newX, gridSize);
        newY = snapToGrid(newY, gridSize);
        newW = Math.max(gridSize, snapToGrid(newW, gridSize));
        newH = Math.max(gridSize, snapToGrid(newH, gridSize));
      }
      onUpdate(id, { x: newX, y: newY, width: newW, height: newH });
    }
  };

  return (
    <Transformer
      ref={transformerRef}
      onTransformEnd={handleTransformEnd}
      rotateEnabled={false}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 5 || newBox.height < 5) return oldBox;
        return newBox;
      }}
    />
  );
}
