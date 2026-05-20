import type { Plan } from './plan';

export type UserPreset = {
  id: string;
  name: string;
  shape: 'rectangle' | 'circle';
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
};

export type Project = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  plans: Plan[];
  userPresets: UserPreset[];
};
