import type { Point } from './geometry';

export type Zone = {
  id: string;
  planId: string;
  name: string;
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  visible: boolean;
  showDimensions?: boolean;
};
