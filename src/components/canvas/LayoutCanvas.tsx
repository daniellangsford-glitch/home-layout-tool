import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Ellipse } from 'react-konva';
import Konva from 'konva';
import type { Plan } from '../../types/plan';
import type { LayoutObject } from '../../types/layoutObject';
import { GridLayer } from './GridLayer';
import { BoundaryLayer } from './BoundaryLayer';
import { BoundaryEditor } from './BoundaryEditor';
import { ZoneLayer } from './ZoneLayer';
import { ZoneTransformerControls } from './ZoneTransformerControls';
import { ObjectLayer } from './ObjectLayer';
import { TransformerControls } from './TransformerControls';
import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';
import { toPixels, toUnits, snapToGrid } from '../../lib/scale';
import { ZONE_COLORS, ZONE_STROKES } from '../objects/DrawTools';

type DrawState = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  shape: 'rectangle' | 'circle' | 'zone';
};

type Props = {
  plan: Plan;
  stageRef: import('react').RefObject<Konva.Stage | null>;
};

export function LayoutCanvas({ plan, stageRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [marqueeState, setMarqueeState] = useState<{
    startX: number; startY: number; currentX: number; currentY: number;
  } | null>(null);

  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const zoom = useCanvasStore((s) => s.zoom);
  const pan = useCanvasStore((s) => s.pan);
  const setCursorPosition = useCanvasStore((s) => s.setCursorPosition);
  const setSelectedObject = useCanvasStore((s) => s.setSelectedObject);
  const setSelectedObjects = useCanvasStore((s) => s.setSelectedObjects);
  const toggleSelectObject = useCanvasStore((s) => s.toggleSelectObject);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const setPan = useCanvasStore((s) => s.setPan);

  const editingZoneId = useCanvasStore((s) => s.editingZoneId);
  const selectedZoneId = useCanvasStore((s) => s.selectedZoneId);

  const updateObject = useProjectStore((s) => s.updateObject);
  const addObject = useProjectStore((s) => s.addObject);
  const addZone = useProjectStore((s) => s.addZone);

  const planWidthPx = toPixels(plan.width, plan.pixelsPerUnit);
  const planHeightPx = toPixels(plan.height, plan.pixelsPerUnit);

  // Fit canvas to container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container);
    setCanvasSize({ width: container.clientWidth, height: container.clientHeight });
    return () => observer.disconnect();
  }, []);

  // Center plan on first render
  useEffect(() => {
    if (canvasSize.width === 0) return;
    const centerX = (canvasSize.width - planWidthPx * zoom) / 2;
    const centerY = (canvasSize.height - planHeightPx * zoom) / 2;
    setPan({ x: Math.max(20, centerX), y: Math.max(20, centerY) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.width, canvasSize.height, plan.id]);

  const getCanvasUnits = useCallback(
    (stage: Konva.Stage): { x: number; y: number } | null => {
      const pos = stage.getPointerPosition();
      if (!pos) return null;
      let x = toUnits((pos.x - pan.x) / zoom, plan.pixelsPerUnit);
      let y = toUnits((pos.y - pan.y) / zoom, plan.pixelsPerUnit);
      if (plan.grid.snapEnabled) {
        x = snapToGrid(x, plan.grid.size);
        y = snapToGrid(y, plan.grid.size);
      }
      return { x, y };
    },
    [pan, zoom, plan.pixelsPerUnit, plan.grid.snapEnabled, plan.grid.size]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const x = toUnits((pos.x - pan.x) / zoom, plan.pixelsPerUnit);
      const y = toUnits((pos.y - pan.y) / zoom, plan.pixelsPerUnit);
      setCursorPosition({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });

      if (drawState) {
        const coords = getCanvasUnits(stage);
        if (coords) setDrawState((prev) => prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null);
      }
      if (marqueeState) {
        // For marquee we skip snapping to allow precise selection
        const rawX = toUnits((pos.x - pan.x) / zoom, plan.pixelsPerUnit);
        const rawY = toUnits((pos.y - pan.y) / zoom, plan.pixelsPerUnit);
        setMarqueeState((prev) => prev ? { ...prev, currentX: rawX, currentY: rawY } : null);
      }
    },
    [pan, zoom, plan.pixelsPerUnit, setCursorPosition, drawState, marqueeState, getCanvasUnits]
  );

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === 'drawRectangle' || activeTool === 'drawCircle' || activeTool === 'drawZone') {
        const stage = e.target.getStage();
        if (!stage) return;
        const coords = getCanvasUnits(stage);
        if (!coords) return;
        const shape = activeTool === 'drawRectangle' ? 'rectangle' : activeTool === 'drawCircle' ? 'circle' : 'zone';
        setDrawState({ startX: coords.x, startY: coords.y, currentX: coords.x, currentY: coords.y, shape });
        return;
      }

      if (activeTool === 'select') {
        const isBackground = e.target === e.target.getStage() || e.target.name() === 'background';
        if (!isBackground) return;
        const stage = e.target.getStage();
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        const rawX = toUnits((pos.x - pan.x) / zoom, plan.pixelsPerUnit);
        const rawY = toUnits((pos.y - pan.y) / zoom, plan.pixelsPerUnit);
        setMarqueeState({ startX: rawX, startY: rawY, currentX: rawX, currentY: rawY });
      }
    },
    [activeTool, getCanvasUnits, pan, zoom, plan.pixelsPerUnit]
  );

  const handleMouseUp = useCallback(() => {
    if (drawState) {
      const x = Math.min(drawState.startX, drawState.currentX);
      const y = Math.min(drawState.startY, drawState.currentY);
      const width = Math.abs(drawState.currentX - drawState.startX);
      const height = Math.abs(drawState.currentY - drawState.startY);

      if (width > 0.1 && height > 0.1) {
        if (drawState.shape === 'zone') {
          const existingZones = plan.zones ?? [];
          const colorIdx = existingZones.length % ZONE_COLORS.length;
          const existingCount = existingZones.filter((z) => z.name.startsWith('Zone')).length;
          addZone(plan.id, {
            planId: plan.id,
            name: existingCount > 0 ? `Zone ${existingCount + 1}` : 'Zone',
            points: [
              { x, y }, { x: x + width, y },
              { x: x + width, y: y + height }, { x, y: y + height },
            ],
            fill: ZONE_COLORS[colorIdx],
            stroke: ZONE_STROKES[colorIdx],
            strokeWidth: 1.5,
            opacity: 0.35,
            visible: true,
          });
        } else {
          const baseName = drawState.shape === 'rectangle' ? 'Rectangle' : 'Circle';
          const existingCount = plan.objects.filter((o) => o.name.startsWith(baseName)).length;
          addObject(plan.id, {
            planId: plan.id,
            name: existingCount > 0 ? `${baseName} ${existingCount + 1}` : baseName,
            shape: drawState.shape,
            x, y, width, height,
            rotation: 0, fill: '#93c5fd', stroke: '#3b82f6', strokeWidth: 1,
            opacity: 1, locked: false, visible: true,
            layerIndex: plan.objects.length, viewCompatibility: 'both',
          });
        }
      }
      setDrawState(null);
      setActiveTool('select');
    }

    if (marqueeState) {
      const selX = Math.min(marqueeState.startX, marqueeState.currentX);
      const selY = Math.min(marqueeState.startY, marqueeState.currentY);
      const selW = Math.abs(marqueeState.currentX - marqueeState.startX);
      const selH = Math.abs(marqueeState.currentY - marqueeState.startY);

      // Only act if dragged a meaningful distance
      if (selW > 0.2 || selH > 0.2) {
        const hit = plan.objects
          .filter((o) => o.visible && !o.locked)
          .filter((o) => {
            const oRight = o.x + o.width;
            const oBottom = o.y + o.height;
            return !(oRight <= selX || o.x >= selX + selW || oBottom <= selY || o.y >= selY + selH);
          })
          .map((o) => o.id);
        setSelectedObjects(hit);
      }
      setMarqueeState(null);
    }
  }, [drawState, marqueeState, plan, addObject, addZone, setActiveTool, setSelectedObjects]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const isBackground = e.target === e.target.getStage() || e.target.name() === 'background';

      if (activeTool === 'placeLabel' && isBackground) {
        const stage = e.target.getStage();
        if (!stage) return;
        const coords = getCanvasUnits(stage);
        if (!coords) return;
        const existingCount = plan.objects.filter((o) => o.name.startsWith('Label')).length;
        addObject(plan.id, {
          planId: plan.id,
          name: existingCount > 0 ? `Label ${existingCount + 1}` : 'Label',
          shape: 'text',
          x: coords.x,
          y: coords.y,
          width: 8,
          height: 1.5,
          rotation: 0,
          fill: '#374151',
          stroke: 'transparent',
          strokeWidth: 0,
          opacity: 1,
          locked: false,
          visible: true,
          layerIndex: plan.objects.length,
          viewCompatibility: 'both',
          fontSize: 14,
        });
        setActiveTool('select');
        return;
      }

      if (activeTool !== 'select') return;
      if (marqueeState) return;
      if (isBackground) clearSelection();
    },
    [clearSelection, activeTool, marqueeState, getCanvasUnits, addObject, plan, setActiveTool]
  );

  const handleObjectSelect = useCallback(
    (id: string, shiftHeld: boolean) => {
      if (shiftHeld) toggleSelectObject(id);
      else setSelectedObject(id);
    },
    [setSelectedObject, toggleSelectObject]
  );

  const handleObjectUpdate = useCallback(
    (id: string, updates: Partial<LayoutObject>) => {
      updateObject(plan.id, id, updates);
    },
    [plan.id, updateObject]
  );

  const isEditMode = activeTool === 'editBoundary';
  const isDrawMode = activeTool === 'drawRectangle' || activeTool === 'drawCircle' || activeTool === 'drawZone';
  const isLabelMode = activeTool === 'placeLabel';
  const isZoneEditMode = editingZoneId !== null;
  const dimensions = plan.dimensions ?? { showOnBoundary: false, showOnZones: false, showOnObjects: false };

  const previewRect = drawState
    ? {
        x: toPixels(Math.min(drawState.startX, drawState.currentX), plan.pixelsPerUnit),
        y: toPixels(Math.min(drawState.startY, drawState.currentY), plan.pixelsPerUnit),
        width: toPixels(Math.abs(drawState.currentX - drawState.startX), plan.pixelsPerUnit),
        height: toPixels(Math.abs(drawState.currentY - drawState.startY), plan.pixelsPerUnit),
      }
    : null;

  const marqueeRect = marqueeState
    ? {
        x: toPixels(Math.min(marqueeState.startX, marqueeState.currentX), plan.pixelsPerUnit),
        y: toPixels(Math.min(marqueeState.startY, marqueeState.currentY), plan.pixelsPerUnit),
        width: toPixels(Math.abs(marqueeState.currentX - marqueeState.startX), plan.pixelsPerUnit),
        height: toPixels(Math.abs(marqueeState.currentY - marqueeState.startY), plan.pixelsPerUnit),
      }
    : null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-100"
      style={{ cursor: isDrawMode || isLabelMode ? 'crosshair' : 'default' }}
    >
      {canvasSize.width > 0 && (
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          scaleX={zoom}
          scaleY={zoom}
          x={pan.x}
          y={pan.y}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleStageClick}
          onTap={() => clearSelection()}
        >
          <Layer>
            <BoundaryLayer
              boundary={plan.boundary}
              planWidth={plan.width}
              planHeight={plan.height}
              pixelsPerUnit={plan.pixelsPerUnit}
              isEditMode={isEditMode}
              showDimensions={dimensions.showOnBoundary}
              unit={plan.unit}
            />
            <GridLayer
              width={planWidthPx}
              height={planHeightPx}
              grid={plan.grid}
              pixelsPerUnit={plan.pixelsPerUnit}
            />
            {!isEditMode && (
              <ZoneLayer
                planId={plan.id}
                zones={plan.zones ?? []}
                pixelsPerUnit={plan.pixelsPerUnit}
                gridSize={plan.grid.size}
                snapEnabled={plan.grid.snapEnabled}
                isInteractive={!isDrawMode && !isLabelMode}
                showDimensions={dimensions.showOnZones}
                unit={plan.unit}
              />
            )}
            {!isEditMode && !isZoneEditMode && (
              <ObjectLayer
                objects={plan.objects}
                pixelsPerUnit={plan.pixelsPerUnit}
                gridSize={plan.grid.size}
                snapEnabled={plan.grid.snapEnabled}
                showDimensions={dimensions.showOnObjects}
                unit={plan.unit}
                selectedIds={selectedObjectIds}
                onSelect={handleObjectSelect}
                onUpdate={handleObjectUpdate}
              />
            )}
            {isEditMode && (
              <BoundaryEditor
                planId={plan.id}
                boundary={plan.boundary}
                pixelsPerUnit={plan.pixelsPerUnit}
                gridSize={plan.grid.size}
                snapEnabled={plan.grid.snapEnabled}
              />
            )}
            {!isEditMode && !isZoneEditMode && (
              <TransformerControls
                selectedIds={selectedObjectIds}
                objects={plan.objects}
                stageRef={stageRef}
                pixelsPerUnit={plan.pixelsPerUnit}
                gridSize={plan.grid.size}
                snapEnabled={plan.grid.snapEnabled}
                onUpdate={handleObjectUpdate}
              />
            )}
            {!isEditMode && !isZoneEditMode && selectedZoneId && (
              <ZoneTransformerControls
                selectedZoneId={selectedZoneId}
                plan={plan}
                stageRef={stageRef}
              />
            )}
            {previewRect && drawState?.shape === 'rectangle' && (
              <Rect
                {...previewRect}
                fill="#93c5fd"
                fillOpacity={0.4}
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            )}
            {previewRect && drawState?.shape === 'circle' && (
              <Ellipse
                x={previewRect.x + previewRect.width / 2}
                y={previewRect.y + previewRect.height / 2}
                radiusX={previewRect.width / 2}
                radiusY={previewRect.height / 2}
                fill="#93c5fd"
                fillOpacity={0.4}
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            )}
            {previewRect && drawState?.shape === 'zone' && (
              <Rect
                {...previewRect}
                fill="#bfdbfe"
                fillOpacity={0.35}
                stroke="#3b82f6"
                strokeWidth={1.5}
                dash={[6, 3]}
                listening={false}
              />
            )}
            {marqueeRect && (
              <Rect
                {...marqueeRect}
                fill="#3b82f6"
                fillOpacity={0.06}
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[4, 3]}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
