import React from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { Button } from '../ui/Button';
import type { Plan } from '../../types/plan';

type Props = {
  activePlan: Plan | null;
};

export function BottomBar({ activePlan }: Props) {
  const cursorPosition = useCanvasStore((s) => s.cursorPosition);
  const zoom = useCanvasStore((s) => s.zoom);
  const setZoom = useCanvasStore((s) => s.setZoom);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const selectedObjectId = useCanvasStore((s) => s.selectedObjectId);

  const selectedObject = activePlan?.objects.find((o) => o.id === selectedObjectId);
  const unit = activePlan?.unit ?? 'ft';

  return (
    <div className="flex items-center h-8 px-4 bg-gray-50 border-t border-gray-200 gap-4 text-xs text-gray-500 shrink-0">
      <span>
        Cursor: {cursorPosition.x} × {cursorPosition.y} {unit}
      </span>
      {selectedObject && (
        <span>
          {selectedObject.name}: {Math.round(selectedObject.width * 10) / 10} × {Math.round(selectedObject.height * 10) / 10} {unit}
        </span>
      )}
      <div className="flex-1" />
      {activePlan?.grid.snapEnabled && <span className="text-green-600">Snap ON</span>}
      {activeTool === 'editBoundary' && <span className="text-blue-600">Shape Edit Mode</span>}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}>−</Button>
        <span>{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(4, zoom + 0.1))}>+</Button>
        <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>Reset</Button>
      </div>
    </div>
  );
}
