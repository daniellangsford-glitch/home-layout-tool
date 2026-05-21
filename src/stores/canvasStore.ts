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

  // 3D-specific
  wallOpacity: number;
  wallHeightEditMode: boolean;
  selectedWallPointIndex: number | null;
  objectHeightEditMode: boolean;
  selectedObjectPointIndex: number | null;

  setSelectedObject: (id: string | null) => void;
  setSelectedObjects: (ids: string[]) => void;
  toggleSelectObject: (id: string) => void;
  setSelectedBoundaryPoint: (index: number | null) => void;
  setSelectedZone: (id: string | null) => void;
  setEditingZone: (id: string | null) => void;
  setSelectedZonePoint: (index: number | null) => void;
  renderMode: '2d' | '3d';
  setRenderMode: (mode: '2d' | '3d') => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setCursorPosition: (pos: Point) => void;
  clearSelection: () => void;

  setWallOpacity: (opacity: number) => void;
  setWallHeightEditMode: (active: boolean) => void;
  setSelectedWallPoint: (index: number | null) => void;
  setObjectHeightEditMode: (active: boolean) => void;
  setSelectedObjectPoint: (index: number | null) => void;
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  selectedObjectIds: [],
  selectedBoundaryPointIndex: null,
  selectedZoneId: null,
  editingZoneId: null,
  selectedZonePointIndex: null,
  renderMode: '2d',
  zoom: 1,
  pan: { x: 0, y: 0 },
  activeTool: 'select',
  cursorPosition: { x: 0, y: 0 },
  wallOpacity: 1,
  wallHeightEditMode: false,
  selectedWallPointIndex: null,
  objectHeightEditMode: false,
  selectedObjectPointIndex: null,

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
  setRenderMode: (mode) => set({ renderMode: mode }),
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

  setWallOpacity: (opacity) => set({ wallOpacity: opacity }),
  setWallHeightEditMode: (active) => set({ wallHeightEditMode: active, selectedWallPointIndex: null }),
  setSelectedWallPoint: (index) => set({ selectedWallPointIndex: index }),
  setObjectHeightEditMode: (active) => set({ objectHeightEditMode: active, selectedObjectPointIndex: null }),
  setSelectedObjectPoint: (index) => set({ selectedObjectPointIndex: index }),
}));
