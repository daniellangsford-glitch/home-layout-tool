import type { Point } from '../types/geometry';
import type { PlanBoundary } from '../types/plan';
import { createRectangleBoundary } from './geometry';

export function createDefaultBoundary(width: number, height: number): PlanBoundary {
  return {
    type: 'rectangle',
    points: createRectangleBoundary(width, height),
  };
}

export function boundaryToFlatArray(points: Point[], pixelsPerUnit: number): number[] {
  return points.flatMap(p => [p.x * pixelsPerUnit, p.y * pixelsPerUnit]);
}
