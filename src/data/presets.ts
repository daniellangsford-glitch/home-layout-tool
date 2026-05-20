import type { ViewMode } from '../types/plan';
import type { ShapeType, ViewCompatibility } from '../types/layoutObject';

export type ObjectPreset = {
  name: string;
  shape: ShapeType;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  viewCompatibility: ViewCompatibility;
};

export const TOP_DOWN_PRESETS: ObjectPreset[] = [
  { name: 'Couch', shape: 'rectangle', width: 7, height: 3, fill: '#b0c4de', stroke: '#6b7280', viewCompatibility: 'topDown' },
  { name: 'Chair', shape: 'rectangle', width: 2.5, height: 2.5, fill: '#b0c4de', stroke: '#6b7280', viewCompatibility: 'topDown' },
  { name: 'Table', shape: 'rectangle', width: 4, height: 3, fill: '#d4a96a', stroke: '#92400e', viewCompatibility: 'topDown' },
  { name: 'Bed (Double)', shape: 'rectangle', width: 5, height: 6.5, fill: '#e9d5ff', stroke: '#7c3aed', viewCompatibility: 'topDown' },
  { name: 'Desk', shape: 'rectangle', width: 4, height: 2, fill: '#d4a96a', stroke: '#92400e', viewCompatibility: 'topDown' },
  { name: 'TV', shape: 'rectangle', width: 4, height: 0.5, fill: '#1f2937', stroke: '#374151', viewCompatibility: 'topDown' },
  { name: 'Dresser', shape: 'rectangle', width: 3.5, height: 1.5, fill: '#d4a96a', stroke: '#92400e', viewCompatibility: 'topDown' },
  { name: 'Rug', shape: 'rectangle', width: 6, height: 4, fill: '#fca5a5', stroke: '#ef4444', viewCompatibility: 'topDown' },
  { name: 'Appliance', shape: 'rectangle', width: 2.5, height: 2.5, fill: '#e5e7eb', stroke: '#6b7280', viewCompatibility: 'topDown' },
  { name: 'Door', shape: 'rectangle', width: 3, height: 0.25, fill: '#92400e', stroke: '#78350f', viewCompatibility: 'topDown' },
  { name: 'Window', shape: 'rectangle', width: 3, height: 0.25, fill: '#bae6fd', stroke: '#0284c7', viewCompatibility: 'topDown' },
  { name: 'Wall', shape: 'rectangle', width: 10, height: 0.5, fill: '#6b7280', stroke: '#374151', viewCompatibility: 'topDown' },
  { name: 'Deck', shape: 'rectangle', width: 12, height: 8, fill: '#d4a96a', stroke: '#92400e', viewCompatibility: 'topDown' },
  { name: 'Tree', shape: 'circle', width: 4, height: 4, fill: '#4ade80', stroke: '#15803d', viewCompatibility: 'topDown' },
  { name: 'Shed', shape: 'rectangle', width: 8, height: 10, fill: '#d1d5db', stroke: '#6b7280', viewCompatibility: 'topDown' },
  { name: 'Garden Bed', shape: 'rectangle', width: 4, height: 2, fill: '#86efac', stroke: '#15803d', viewCompatibility: 'topDown' },
  { name: 'Fence', shape: 'rectangle', width: 10, height: 0.5, fill: '#92400e', stroke: '#78350f', viewCompatibility: 'topDown' },
  { name: 'Custom Rectangle', shape: 'rectangle', width: 3, height: 3, fill: '#e5e7eb', stroke: '#6b7280', viewCompatibility: 'both' },
  { name: 'Custom Circle', shape: 'circle', width: 3, height: 3, fill: '#e5e7eb', stroke: '#6b7280', viewCompatibility: 'both' },
];

export const SIDE_VIEW_PRESETS: ObjectPreset[] = [
  { name: 'Wall Art', shape: 'rectangle', width: 2, height: 1.5, fill: '#fde68a', stroke: '#d97706', viewCompatibility: 'sideView' },
  { name: 'TV', shape: 'rectangle', width: 4, height: 2.25, fill: '#1f2937', stroke: '#374151', viewCompatibility: 'sideView' },
  { name: 'Shelf', shape: 'rectangle', width: 3, height: 0.25, fill: '#d4a96a', stroke: '#92400e', viewCompatibility: 'sideView' },
  { name: 'Window', shape: 'rectangle', width: 3, height: 3, fill: '#bae6fd', stroke: '#0284c7', viewCompatibility: 'sideView' },
  { name: 'Door', shape: 'rectangle', width: 3, height: 6.5, fill: '#92400e', stroke: '#78350f', viewCompatibility: 'sideView' },
  { name: 'Couch', shape: 'rectangle', width: 7, height: 3, fill: '#b0c4de', stroke: '#6b7280', viewCompatibility: 'sideView' },
  { name: 'Bed', shape: 'rectangle', width: 5, height: 2, fill: '#e9d5ff', stroke: '#7c3aed', viewCompatibility: 'sideView' },
  { name: 'Dresser', shape: 'rectangle', width: 3.5, height: 4, fill: '#d4a96a', stroke: '#92400e', viewCompatibility: 'sideView' },
  { name: 'Desk', shape: 'rectangle', width: 4, height: 3, fill: '#d4a96a', stroke: '#92400e', viewCompatibility: 'sideView' },
  { name: 'Tree', shape: 'circle', width: 4, height: 4, fill: '#4ade80', stroke: '#15803d', viewCompatibility: 'sideView' },
  { name: 'Fence', shape: 'rectangle', width: 8, height: 4, fill: '#92400e', stroke: '#78350f', viewCompatibility: 'sideView' },
  { name: 'Custom Rectangle', shape: 'rectangle', width: 3, height: 3, fill: '#e5e7eb', stroke: '#6b7280', viewCompatibility: 'both' },
  { name: 'Custom Circle', shape: 'circle', width: 3, height: 3, fill: '#e5e7eb', stroke: '#6b7280', viewCompatibility: 'both' },
];

export function getPresetsForViewMode(viewMode: ViewMode): ObjectPreset[] {
  return viewMode === 'topDown' ? TOP_DOWN_PRESETS : SIDE_VIEW_PRESETS;
}
