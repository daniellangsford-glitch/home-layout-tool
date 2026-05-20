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
};
