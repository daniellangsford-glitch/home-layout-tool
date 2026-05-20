import type { Project } from '../types/project';
import { generateId } from '../lib/ids';
import { createDefaultBoundary } from '../lib/boundary';

export function createSampleProject(): Project {
  const projectId = generateId();
  const planId = generateId();
  const now = new Date().toISOString();

  return {
    id: projectId,
    name: 'My Home Layout',
    createdAt: now,
    updatedAt: now,
    plans: [
      {
        id: planId,
        name: 'Main Floor',
        type: 'floor',
        viewMode: 'topDown',
        unit: 'ft',
        width: 40,
        height: 30,
        pixelsPerUnit: 20,
        boundary: createDefaultBoundary(40, 30),
        grid: {
          visible: true,
          snapEnabled: true,
          size: 1,
          majorLineEvery: 5,
          opacity: 1,
        },
        objects: [],
        zones: [],
        dimensions: { showOnBoundary: false, showOnZones: false, showOnObjects: false },
        createdAt: now,
        updatedAt: now,
      },
    ],
    userPresets: [],
  };
}
