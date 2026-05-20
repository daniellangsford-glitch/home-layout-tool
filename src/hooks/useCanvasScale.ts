import { useMemo } from 'react';
import type { Plan } from '../types/plan';

export function useCanvasScale(plan: Plan | null) {
  return useMemo(() => {
    if (!plan) return { width: 0, height: 0, pixelsPerUnit: 20 };
    return {
      width: plan.width * plan.pixelsPerUnit,
      height: plan.height * plan.pixelsPerUnit,
      pixelsPerUnit: plan.pixelsPerUnit,
    };
  }, [plan]);
}
