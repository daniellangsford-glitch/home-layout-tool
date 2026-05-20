import { describe, it, expect } from 'vitest';
import { toPixels, toUnits, snapToGrid, formatMeasurement } from '../lib/scale';

describe('toPixels', () => {
  it('converts units to pixels', () => {
    expect(toPixels(10, 20)).toBe(200);
    expect(toPixels(0, 20)).toBe(0);
    expect(toPixels(1.5, 20)).toBe(30);
  });
});

describe('toUnits', () => {
  it('converts pixels to units', () => {
    expect(toUnits(200, 20)).toBe(10);
    expect(toUnits(0, 20)).toBe(0);
    expect(toUnits(30, 20)).toBe(1.5);
  });
});

describe('snapToGrid', () => {
  it('snaps values to grid', () => {
    expect(snapToGrid(2.3, 1)).toBe(2);
    expect(snapToGrid(2.6, 1)).toBe(3);
    expect(snapToGrid(5.2, 2)).toBe(6);
    expect(snapToGrid(5.5, 2)).toBe(6);
    expect(snapToGrid(4.9, 2)).toBe(4);
  });

  it('returns value unchanged when gridSize is 0', () => {
    expect(snapToGrid(2.7, 0)).toBe(2.7);
  });
});

describe('formatMeasurement', () => {
  it('formats measurements with units', () => {
    expect(formatMeasurement(10, 'ft')).toBe('10 ft');
    expect(formatMeasurement(1.5, 'm')).toBe('1.5 m');
  });
});
