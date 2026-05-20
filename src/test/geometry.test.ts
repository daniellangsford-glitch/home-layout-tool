import { describe, it, expect } from 'vitest';
import {
  createRectangleBoundary,
  isPointInsidePolygon,
  getPolygonBounds,
  calculateDistance,
  insertPointOnEdge,
  removeBoundaryPoint,
} from '../lib/geometry';

describe('createRectangleBoundary', () => {
  it('creates 4 corner points', () => {
    const pts = createRectangleBoundary(10, 5);
    expect(pts).toHaveLength(4);
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[1]).toEqual({ x: 10, y: 0 });
    expect(pts[2]).toEqual({ x: 10, y: 5 });
    expect(pts[3]).toEqual({ x: 0, y: 5 });
  });
});

describe('isPointInsidePolygon', () => {
  const square = createRectangleBoundary(10, 10);

  it('detects point inside', () => {
    expect(isPointInsidePolygon({ x: 5, y: 5 }, square)).toBe(true);
  });

  it('detects point outside', () => {
    expect(isPointInsidePolygon({ x: 15, y: 5 }, square)).toBe(false);
    expect(isPointInsidePolygon({ x: -1, y: 5 }, square)).toBe(false);
  });
});

describe('getPolygonBounds', () => {
  it('returns correct bounds', () => {
    const pts = [{ x: 1, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 8 }, { x: 1, y: 8 }];
    expect(getPolygonBounds(pts)).toEqual({ x: 1, y: 2, width: 4, height: 6 });
  });

  it('handles empty array', () => {
    expect(getPolygonBounds([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});

describe('calculateDistance', () => {
  it('calculates Euclidean distance', () => {
    expect(calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(calculateDistance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
  });
});

describe('insertPointOnEdge', () => {
  it('inserts a point after the given edge index', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    const result = insertPointOnEdge(pts, 0, { x: 5, y: 0 });
    expect(result).toHaveLength(5);
    expect(result[1]).toEqual({ x: 5, y: 0 });
  });
});

describe('removeBoundaryPoint', () => {
  it('removes a point', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    const result = removeBoundaryPoint(pts, 1);
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ x: 10, y: 10 });
  });

  it('does not remove if fewer than 3 points remain', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 5 }];
    expect(removeBoundaryPoint(pts, 0)).toHaveLength(3);
  });
});
