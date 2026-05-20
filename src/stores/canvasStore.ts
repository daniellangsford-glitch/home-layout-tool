import { create } from 'zustand';
import type { Point } from '../types/geometry';

export type ActiveTool = 'select' | 'addObject' | 'editBoundary' | 'pan' | 'drawRectangle' | 'drawCircle' | 'drawZone' | 'placeLabel';

type CanvasStore = {
  selectedObjectIds: string[];
  selectedBoundaryPointIndex: number | null;
  selectedZoneId: string | null;
  editingZoneId: string | null;
  selectedZonePointIndex: number | null;
  zoom: number;
  pan: Point;
  activeTool: ActiveTool;
  cursorPosition: Point;

  setSelectedObject: (id: string | null) => void;
  setSelectedObjects: (ids: string[]) => void;
  toggleSelectObject: (id: string) => void;
  setSelectedBoundaryPoint: (index: number | null) => void;
  setSelectedZone: (id: string | null) => void;
  setEditingZone: (id: string | null) => void;
  setSelectedZonePoint: (index: number | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setCursorPosition: (pos: Point) => void;
  clearSelection: () => void;
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  selectedObjectIds: [],
  selectedBoundaryPointIndex: null,
  selectedZoneId: null,
  editingZoneId: null,
  selectedZonePointIndex: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  activeTool: 'select',
  cursorPosition: { x: 0, y: 0 },

  setSelectedObject: (id) => set({
    selectedObjectIds: id ? [id] : [],
    selectedBoundaryPointIndex: null,
    selectedZoneId: null,
  }),
  setSelectedObjects: (ids) => set({
    selectedObjectIds: ids,
    selectedBoundaryPointIndex: null,
    selectedZoneId: null,
  }),
  toggleSelectObject: (id) => {
    const { selectedObjectIds } = get();
    const next = selectedObjectIds.includes(id)
      ? selectedObjectIds.filter((x) => x !== id)
      : [...selectedObjectIds, id];
    set({ selectedObjectIds: next, selectedBoundaryPointIndex: null, selectedZoneId: null });
  },
  setSelectedBoundaryPoint: (index) => set({ selectedBoundaryPointIndex: index, selectedObjectIds: [], selectedZoneId: null }),
  setSelectedZone: (id) => set({ selectedZoneId: id, selectedObjectIds: [], selectedBoundaryPointIndex: null }),
  setEditingZone: (id) => set({ editingZoneId: id, selectedZonePointIndex: null }),
  setSelectedZonePoint: (index) => set({ selectedZonePointIndex: index }),
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  clearSelection: () => set({
    selectedObjectIds: [],
    selectedBoundaryPointIndex: null,
    selectedZoneId: null,
    editingZoneId: null,
    selectedZonePointIndex: null,
  }),
}));
