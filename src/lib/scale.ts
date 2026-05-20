import type { MeasurementUnit } from '../types/plan';

export function toPixels(value: number, pixelsPerUnit: number): number {
  return value * pixelsPerUnit;
}

export function toUnits(value: number, pixelsPerUnit: number): number {
  return value / pixelsPerUnit;
}

export function formatMeasurement(value: number, unit: MeasurementUnit): string {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded} ${unit}`;
}

export function snapToGrid(value: number, gridSize: number): number {
  if (gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}
