import { z } from 'zod';

const PointSchema = z.object({ x: z.number(), y: z.number() });

const PlanBoundarySchema = z.object({
  type: z.enum(['rectangle', 'polygon']),
  points: z.array(PointSchema).min(3),
  pointHeights: z.array(z.number().nonnegative().nullable()).optional(),
});

const GridSettingsSchema = z.object({
  visible: z.boolean(),
  snapEnabled: z.boolean(),
  size: z.number().positive(),
  majorLineEvery: z.number().positive(),
  opacity: z.number().min(0).max(1).optional().default(1),
});

const DimensionsConfigSchema = z.object({
  showOnBoundary: z.boolean().default(false),
  showOnZones: z.boolean().default(false),
  showOnObjects: z.boolean().default(false),
});

const LayoutObjectSchema = z.object({
  id: z.string(),
  planId: z.string(),
  name: z.string(),
  shape: z.enum(['rectangle', 'circle', 'ellipse', 'line', 'text']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number(),
  opacity: z.number().min(0).max(1),
  locked: z.boolean(),
  visible: z.boolean(),
  layerIndex: z.number(),
  viewCompatibility: z.enum(['topDown', 'sideView', 'both']),
  fontSize: z.number().positive().optional(),
  snapDisabled: z.boolean().optional(),
  showDimensions: z.boolean().optional(),
  height3d: z.number().positive().optional(),
  elevation: z.number().min(0).optional(),
});

const ZoneSchema = z.object({
  id: z.string(),
  planId: z.string(),
  name: z.string(),
  points: z.array(PointSchema).min(3),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number(),
  opacity: z.number().min(0).max(1),
  visible: z.boolean(),
  showDimensions: z.boolean().optional(),
});

const PlanSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['floor', 'room', 'backyard', 'garage', 'custom']),
  viewMode: z.enum(['topDown', 'sideView']),
  unit: z.enum(['ft', 'in', 'm', 'cm']),
  width: z.number().positive(),
  height: z.number().positive(),
  pixelsPerUnit: z.number().positive(),
  wallHeight: z.number().nonnegative().optional(),
  boundary: PlanBoundarySchema,
  grid: GridSettingsSchema,
  objects: z.array(LayoutObjectSchema),
  zones: z.array(ZoneSchema).optional().default([]),
  dimensions: DimensionsConfigSchema.optional().default({ showOnBoundary: false, showOnZones: false, showOnObjects: false }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const UserPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  shape: z.enum(['rectangle', 'circle']),
  width: z.number().positive(),
  height: z.number().positive(),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number(),
  opacity: z.number().min(0).max(1),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  plans: z.array(PlanSchema),
  userPresets: z.array(UserPresetSchema).optional().default([]),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
