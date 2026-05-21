export type ShapeType = 'rectangle' | 'circle' | 'ellipse' | 'line' | 'text';

export type ViewCompatibility = 'topDown' | 'sideView' | 'both';

export type LayoutObject = {
  id: string;
  planId: string;
  name: string;
  shape: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  layerIndex: number;
  viewCompatibility: ViewCompatibility;
  fontSize?: number;
  snapDisabled?: boolean;
  showDimensions?: boolean;
  height3d?: number;
  /** Vertical floor offset in real-world units (0 = on the floor, positive = elevated). Used in 3D rendering. */
  elevation?: number;
  /**
   * Per-corner heights for rectangle objects in 3D (index 0–3: front-left, front-right, back-right, back-left).
   * null = use height3d for that corner.
   */
  cornerHeights?: (number | null)[];
  /**
   * World-space polygon footprint for 3D rendering (plan x/y coordinates).
   * When set, overrides the default 4 rectangle corners. Used when steps are added.
   */
  footprint3d?: { x: number; y: number }[];
};
