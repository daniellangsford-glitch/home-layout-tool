import { useEffect } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { useProjectStore } from '../stores/projectStore';

export function useKeyboardShortcuts() {
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const selectedBoundaryPointIndex = useCanvasStore((s) => s.selectedBoundaryPointIndex);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const getActivePlan = useProjectStore((s) => s.getActivePlan);
  const deleteObject = useProjectStore((s) => s.deleteObject);
  const duplicateObject = useProjectStore((s) => s.duplicateObject);
  const removeBoundaryPoint = useProjectStore((s) => s.removeBoundaryPoint);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const plan = getActivePlan();
      if (!plan) return;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.shiftKey && e.key === 'z'))
      ) {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === 'Escape') {
        if (activeTool !== 'select') setActiveTool('select');
        clearSelection();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectIds.length > 0) {
          selectedObjectIds.forEach((id) => deleteObject(plan.id, id));
          clearSelection();
        } else if (selectedBoundaryPointIndex !== null) {
          removeBoundaryPoint(plan.id, selectedBoundaryPointIndex);
          clearSelection();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedObjectIds.length > 0) {
          selectedObjectIds.forEach((id) => duplicateObject(plan.id, id));
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    selectedObjectIds,
    selectedBoundaryPointIndex,
    activeTool,
    clearSelection,
    setActiveTool,
    getActivePlan,
    deleteObject,
    duplicateObject,
    removeBoundaryPoint,
    undo,
    redo,
  ]);
}
