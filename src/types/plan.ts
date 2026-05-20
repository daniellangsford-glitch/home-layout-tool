import type { Point } from './geometry';
import type { LayoutObject } from './layoutObject';
import type { Zone } from './zone';

export type MeasurementUnit = 'ft' | 'in' | 'm' | 'cm';

export type PlanType = 'floor' | 'room' | 'backyard' | 'garage' | 'custom';

export type ViewMode = 'topDown' | 'sideView';

export type BoundaryType = 'rectangle' | 'polygon';

export type PlanBoundary = {
  type: BoundaryType;
  points: Point[];
};

export type DimensionsConfig = {
  showOnBoundary: boolean;
  showOnZones: boolean;
  showOnObjects: boolean;
};

export type GridSettings = {
  visible: boolean;
  snapEnabled: boolean;
  size: number;
  majorLineEvery: number;
  opacity: number;
};

export type Plan = {
  id: string;
  name: string;
  type: PlanType;
  viewMode: ViewMode;
  unit: MeasurementUnit;
  width: number;
  height: number;
  pixelsPerUnit: number;
  boundary: PlanBoundary;
  grid: GridSettings;
  objects: LayoutObject[];
  zones: Zone[];
  dimensions: DimensionsConfig;
  createdAt: string;
  updatedAt: string;
};
