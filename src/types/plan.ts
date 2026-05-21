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
  /** Per-corner wall heights (index matches points). null = use plan wallHeight default. */
  pointHeights?: (number | null)[];
  /** Per-segment wall colours (index = starting corner). null = use plan wallColor default. */
  wallColors?: (string | null)[];
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
  /** Default wall height for the 3D view. Falls back to unit-based default if absent. */
  wallHeight?: number;
  /** Default wall colour in 3D view. Falls back to '#e2e8f0' if absent. */
  wallColor?: string;
  /** Inner floor colour in 3D view. Falls back to '#f8fafc' if absent. */
  floorColor?: string;
  boundary: PlanBoundary;
  grid: GridSettings;
  objects: LayoutObject[];
  zones: Zone[];
  dimensions: DimensionsConfig;
  createdAt: string;
  updatedAt: string;
};
