import React, { useRef, useEffect } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import type { Plan } from '../../types/plan';
import { toPixels, toUnits } from '../../lib/scale';
import { getPolygonBounds } from '../../lib/geometry';
import { useProjectStore } from '../../stores/projectStore';

type Props = {
  selectedZoneId: string | null;
  plan: Plan;
  stageRef: React.RefObject<Konva.Stage | null>;
};

export function ZoneTransformerControls({ selectedZoneId, plan, stageRef }: Props) {
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const updateZone = useProjectStore((s) => s.updateZone);

  const pixelsPerUnit = plan.pixelsPerUnit;

  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    if (!selectedZoneId) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }
    const node = stageRef.current.findOne(`#zone-${selectedZoneId}`);
    if (node) {
      transformerRef.current.nodes([node]);
    } else {
      transformerRef.current.nodes([]);
    }
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedZoneId, stageRef]);

  const handleTransformEnd = () => {
    if (!selectedZoneId || !stageRef.current) return;
    const node = stageRef.current.findOne(`#zone-${selectedZoneId}`);
    if (!node) return;

    const zone = (plan.zones ?? []).find((z) => z.id === selectedZoneId);
    if (!zone) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newX = node.x();
    const newY = node.y();
    const origWidth = node.width();
    const origHeight = node.height();

    node.scaleX(1);
    node.scaleY(1);

    const newWidth = origWidth * scaleX;
    const newHeight = origHeight * scaleY;

    // Old bounding box from zone points in pixels
    const bounds = getPolygonBounds(zone.points);
    const oldBw = toPixels(bounds.width, pixelsPerUnit);
    const oldBh = toPixels(bounds.height, pixelsPerUnit);
    const oldBx = toPixels(bounds.x, pixelsPerUnit);
    const oldBy = toPixels(bounds.y, pixelsPerUnit);

    if (oldBw === 0 || oldBh === 0) return;

    const newPoints = zone.points.map((p) => {
      const px = toPixels(p.x, pixelsPerUnit);
      const py = toPixels(p.y, pixelsPerUnit);
      const normX = (px - oldBx) / oldBw;
      const normY = (py - oldBy) / oldBh;
      return {
        x: toUnits(newX + normX * newWidth, pixelsPerUnit),
        y: toUnits(newY + normY * newHeight, pixelsPerUnit),
      };
    });

    updateZone(plan.id, selectedZoneId, { points: newPoints });
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
