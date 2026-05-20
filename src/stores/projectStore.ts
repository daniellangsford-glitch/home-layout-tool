import { create } from 'zustand';
import type { Project, UserPreset } from '../types/project';
import type { Zone } from '../types/zone';
import type { Plan, PlanBoundary, GridSettings, PlanType, ViewMode, MeasurementUnit } from '../types/plan';
import type { LayoutObject } from '../types/layoutObject';
import type { Point } from '../types/geometry';
import { generateId } from '../lib/ids';
import { createDefaultBoundary } from '../lib/boundary';
import { createRectangleBoundary, insertPointOnEdge, removeBoundaryPoint } from '../lib/geometry';
import { saveProject, loadLatestProject } from '../lib/storage';
import { createSampleProject } from '../data/sampleProject';
import { exportProjectJSON, importProjectJSON } from '../lib/export';

type SaveState = 'saved' | 'saving' | 'unsaved' | 'error';

function pushPast(past: Project[], current: Project): Project[] {
  return [...past, current].slice(-50);
}

type ProjectStore = {
  project: Project;
  activePlanId: string | null;
  saveState: SaveState;
  past: Project[];
  future: Project[];

  undo: () => void;
  redo: () => void;

  // Plan
  setActivePlan: (planId: string) => void;
  createPlan: (data: Partial<Pick<Plan, 'name' | 'type' | 'viewMode' | 'unit' | 'width' | 'height'>>) => void;
  updatePlan: (planId: string, updates: Partial<Plan>) => void;
  deletePlan: (planId: string) => void;
  duplicatePlan: (planId: string) => void;

  // Objects
  addObject: (planId: string, object: Omit<LayoutObject, 'id'>) => void;
  updateObject: (planId: string, objectId: string, updates: Partial<LayoutObject>) => void;
  deleteObject: (planId: string, objectId: string) => void;
  duplicateObject: (planId: string, objectId: string) => void;
  reorderObject: (planId: string, objectId: string, direction: 'up' | 'down') => void;

  // Boundary
  updateBoundary: (planId: string, boundary: PlanBoundary) => void;
  moveBoundaryPoint: (planId: string, pointIndex: number, point: Point) => void;
  addBoundaryPoint: (planId: string, edgeIndex: number, point: Point) => void;
  removeBoundaryPoint: (planId: string, pointIndex: number) => void;
  resetBoundaryToRectangle: (planId: string) => void;

  // Zones
  addZone: (planId: string, zone: Omit<Zone, 'id'>) => void;
  updateZone: (planId: string, zoneId: string, updates: Partial<Zone>) => void;
  deleteZone: (planId: string, zoneId: string) => void;
  moveZonePoint: (planId: string, zoneId: string, pointIndex: number, point: Point) => void;
  addZonePoint: (planId: string, zoneId: string, edgeIndex: number, point: Point) => void;
  removeZonePoint: (planId: string, zoneId: string, pointIndex: number) => void;

  // User Presets
  saveUserPreset: (preset: Omit<UserPreset, 'id'>) => void;
  removeUserPreset: (presetId: string) => void;

  // Persistence
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  importProject: (json: string) => void;
  exportProject: () => void;

  getActivePlan: () => Plan | null;
};

function touchPlan(plan: Plan): Plan {
  return { ...plan, updatedAt: new Date().toISOString() };
}

function touchProject(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: createSampleProject(),
  activePlanId: null,
  saveState: 'unsaved',
  past: [],
  future: [],

  undo: () => {
    const { project, past, future, activePlanId } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const restoredActivePlanId = previous.plans.find((p) => p.id === activePlanId)
      ? activePlanId
      : (previous.plans[0]?.id ?? null);
    set({
      project: previous,
      past: past.slice(0, -1),
      future: [project, ...future].slice(0, 50),
      activePlanId: restoredActivePlanId,
      saveState: 'unsaved',
    });
  },

  redo: () => {
    const { project, past, future, activePlanId } = get();
    if (future.length === 0) return;
    const next = future[0];
    const restoredActivePlanId = next.plans.find((p) => p.id === activePlanId)
      ? activePlanId
      : (next.plans[0]?.id ?? null);
    set({
      project: next,
      past: [...past, project].slice(-50),
      future: future.slice(1),
      activePlanId: restoredActivePlanId,
      saveState: 'unsaved',
    });
  },

  setActivePlan: (planId) => set({ activePlanId: planId }),

  createPlan: (data) => {
    const now = new Date().toISOString();
    const width = data.width ?? 20;
    const height = data.height ?? 15;
    const newPlan: Plan = {
      id: generateId(),
      name: data.name ?? 'New Plan',
      type: data.type ?? 'custom',
      viewMode: data.viewMode ?? 'topDown',
      unit: data.unit ?? 'ft',
      width,
      height,
      pixelsPerUnit: 20,
      boundary: createDefaultBoundary(width, height),
      grid: { visible: true, snapEnabled: true, size: 1, majorLineEvery: 5, opacity: 1 },
      objects: [],
      zones: [],
      dimensions: { showOnBoundary: false, showOnZones: false, showOnObjects: false },
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({ ...state.project, plans: [...state.project.plans, newPlan] }),
      activePlanId: newPlan.id,
      saveState: 'unsaved',
    }));
  },

  updatePlan: (planId, updates) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) =>
          p.id === planId ? touchPlan({ ...p, ...updates }) : p
        ),
      }),
      saveState: 'unsaved',
    }));
  },

  deletePlan: (planId) => {
    set((state) => {
      const plans = state.project.plans.filter((p) => p.id !== planId);
      const activePlanId =
        state.activePlanId === planId
          ? (plans[0]?.id ?? null)
          : state.activePlanId;
      return {
        past: pushPast(state.past, state.project), future: [],
        project: touchProject({ ...state.project, plans }),
        activePlanId,
        saveState: 'unsaved',
      };
    });
  },

  duplicatePlan: (planId) => {
    const plan = get().project.plans.find((p) => p.id === planId);
    if (!plan) return;
    const now = new Date().toISOString();
    const newPlan: Plan = {
      ...plan,
      id: generateId(),
      name: `${plan.name} (Copy)`,
      objects: plan.objects.map((o) => ({ ...o, id: generateId(), planId: generateId() })),
      zones: (plan.zones ?? []).map((z) => ({ ...z, id: generateId() })),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({ ...state.project, plans: [...state.project.plans, newPlan] }),
      activePlanId: newPlan.id,
      saveState: 'unsaved',
    }));
  },

  addObject: (planId, objectData) => {
    const object: LayoutObject = { ...objectData, id: generateId() };
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) =>
          p.id === planId ? touchPlan({ ...p, objects: [...p.objects, object] }) : p
        ),
      }),
      saveState: 'unsaved',
    }));
  },

  updateObject: (planId, objectId, updates) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) =>
          p.id === planId
            ? touchPlan({
                ...p,
                objects: p.objects.map((o) =>
                  o.id === objectId ? { ...o, ...updates } : o
                ),
              })
            : p
        ),
      }),
      saveState: 'unsaved',
    }));
  },

  deleteObject: (planId, objectId) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) =>
          p.id === planId
            ? touchPlan({ ...p, objects: p.objects.filter((o) => o.id !== objectId) })
            : p
        ),
      }),
      saveState: 'unsaved',
    }));
  },

  duplicateObject: (planId, objectId) => {
    const plan = get().project.plans.find((p) => p.id === planId);
    const obj = plan?.objects.find((o) => o.id === objectId);
    if (!obj) return;
    const newObj: LayoutObject = {
      ...obj,
      id: generateId(),
      x: obj.x + 1,
      y: obj.y + 1,
      layerIndex: obj.layerIndex + 1,
    };
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) =>
          p.id === planId ? touchPlan({ ...p, objects: [...p.objects, newObj] }) : p
        ),
      }),
      saveState: 'unsaved',
    }));
  },

  reorderObject: (planId, objectId, direction) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) => {
          if (p.id !== planId) return p;
          const objects = [...p.objects].sort((a, b) => a.layerIndex - b.layerIndex);
          const idx = objects.findIndex((o) => o.id === objectId);
          if (idx === -1) return p;
          if (direction === 'up' && idx < objects.length - 1) {
            [objects[idx].layerIndex, objects[idx + 1].layerIndex] = [
              objects[idx + 1].layerIndex,
              objects[idx].layerIndex,
            ];
          } else if (direction === 'down' && idx > 0) {
            [objects[idx].layerIndex, objects[idx - 1].layerIndex] = [
              objects[idx - 1].layerIndex,
              objects[idx].layerIndex,
            ];
          }
          return touchPlan({ ...p, objects });
        }),
      }),
      saveState: 'unsaved',
    }));
  },

  updateBoundary: (planId, boundary) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) =>
          p.id === planId ? touchPlan({ ...p, boundary }) : p
        ),
      }),
      saveState: 'unsaved',
    }));
  },

  moveBoundaryPoint: (planId, pointIndex, point) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) => {
          if (p.id !== planId) return p;
          const points = p.boundary.points.map((pt, i) =>
            i === pointIndex ? point : pt
          );
          return touchPlan({ ...p, boundary: { ...p.boundary, points } });
        }),
      }),
      saveState: 'unsaved',
    }));
  },

  addBoundaryPoint: (planId, edgeIndex, point) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) => {
          if (p.id !== planId) return p;
          const points = insertPointOnEdge(p.boundary.points, edgeIndex, point);
          return touchPlan({ ...p, boundary: { type: 'polygon', points } });
        }),
      }),
      saveState: 'unsaved',
    }));
  },

  removeBoundaryPoint: (planId, pointIndex) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) => {
          if (p.id !== planId) return p;
          const points = removeBoundaryPoint(p.boundary.points, pointIndex);
          return touchPlan({ ...p, boundary: { ...p.boundary, points } });
        }),
      }),
      saveState: 'unsaved',
    }));
  },

  resetBoundaryToRectangle: (planId) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) => {
          if (p.id !== planId) return p;
          const points = createRectangleBoundary(p.width, p.height);
          return touchPlan({ ...p, boundary: { type: 'rectangle', points } });
        }),
      }),
      saveState: 'unsaved',
    }));
  },

  addZone: (planId, zoneData) => {
    const zone: Zone = { ...zoneData, id: generateId() };
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) =>
          p.id === planId ? touchPlan({ ...p, zones: [...(p.zones ?? []), zone] }) : p
        ),
      }),
      saveState: 'unsaved',
    }));
  },

  updateZone: (planId, zoneId, updates) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) =>
          p.id === planId
            ? touchPlan({ ...p, zones: (p.zones ?? []).map((z) => z.id === zoneId ? { ...z, ...updates } : z) })
            : p
        ),
      }),
      saveState: 'unsaved',
    }));
  },

  deleteZone: (planId, zoneId) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) =>
          p.id === planId
            ? touchPlan({ ...p, zones: (p.zones ?? []).filter((z) => z.id !== zoneId) })
            : p
        ),
      }),
      saveState: 'unsaved',
    }));
  },

  moveZonePoint: (planId, zoneId, pointIndex, point) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) => {
          if (p.id !== planId) return p;
          const zones = (p.zones ?? []).map((z) => {
            if (z.id !== zoneId) return z;
            const points = z.points.map((pt, i) => (i === pointIndex ? point : pt));
            return { ...z, points };
          });
          return touchPlan({ ...p, zones });
        }),
      }),
      saveState: 'unsaved',
    }));
  },

  addZonePoint: (planId, zoneId, edgeIndex, point) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) => {
          if (p.id !== planId) return p;
          const zones = (p.zones ?? []).map((z) => {
            if (z.id !== zoneId) return z;
            const points = insertPointOnEdge(z.points, edgeIndex, point);
            return { ...z, points };
          });
          return touchPlan({ ...p, zones });
        }),
      }),
      saveState: 'unsaved',
    }));
  },

  removeZonePoint: (planId, zoneId, pointIndex) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        plans: state.project.plans.map((p) => {
          if (p.id !== planId) return p;
          const zones = (p.zones ?? []).map((z) => {
            if (z.id !== zoneId) return z;
            const points = removeBoundaryPoint(z.points, pointIndex);
            return { ...z, points };
          });
          return touchPlan({ ...p, zones });
        }),
      }),
      saveState: 'unsaved',
    }));
  },

  saveUserPreset: (preset) => {
    const newPreset: UserPreset = { ...preset, id: generateId() };
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        userPresets: [...(state.project.userPresets ?? []), newPreset],
      }),
      saveState: 'unsaved',
    }));
  },

  removeUserPreset: (presetId) => {
    set((state) => ({
      past: pushPast(state.past, state.project), future: [],
      project: touchProject({
        ...state.project,
        userPresets: (state.project.userPresets ?? []).filter((p) => p.id !== presetId),
      }),
      saveState: 'unsaved',
    }));
  },

  saveToStorage: async () => {
    set({ saveState: 'saving' });
    try {
      await saveProject(get().project);
      set({ saveState: 'saved' });
    } catch {
      set({ saveState: 'error' });
    }
  },

  loadFromStorage: async () => {
    const project = await loadLatestProject();
    if (project) {
      const normalized = {
        userPresets: [],
        ...project,
        plans: project.plans.map((p) => ({
          zones: [],
          dimensions: { showOnBoundary: false, showOnZones: false, showOnObjects: false },
          ...p,
        })),
      };
      set({
        project: normalized,
        activePlanId: normalized.plans[0]?.id ?? null,
        saveState: 'saved',
        past: [],
        future: [],
      });
    } else {
      const sample = createSampleProject();
      set({
        project: sample,
        activePlanId: sample.plans[0]?.id ?? null,
        saveState: 'unsaved',
        past: [],
        future: [],
      });
    }
  },

  importProject: (json) => {
    const project = importProjectJSON(json);
    set({
      project,
      activePlanId: project.plans[0]?.id ?? null,
      saveState: 'unsaved',
      past: [],
      future: [],
    });
  },

  exportProject: () => {
    exportProjectJSON(get().project);
  },

  getActivePlan: () => {
    const { project, activePlanId } = get();
    if (!activePlanId) return project.plans[0] ?? null;
    return project.plans.find((p) => p.id === activePlanId) ?? null;
  },
}));
