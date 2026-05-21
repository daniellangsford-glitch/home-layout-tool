import { ObjectInspector } from '../objects/ObjectInspector';
import { PlanSettings } from '../plans/PlanSettings';
import { ZoneInspector } from '../zones/ZoneInspector';
import { ThreeDSettings } from '../canvas3d/ThreeDSettings';
import { useCanvasStore } from '../../stores/canvasStore';
import type { Plan } from '../../types/plan';

type Props = {
  activePlan: Plan | null;
};

export function RightSidebar({ activePlan }: Props) {
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const selectedBoundaryPointIndex = useCanvasStore((s) => s.selectedBoundaryPointIndex);
  const selectedZoneId = useCanvasStore((s) => s.selectedZoneId);
  const editingZoneId = useCanvasStore((s) => s.editingZoneId);
  const renderMode = useCanvasStore((s) => s.renderMode);

  const hasObjectSelection = selectedObjectIds.length > 0 || selectedBoundaryPointIndex !== null;
  const hasZoneSelection = selectedZoneId !== null || editingZoneId !== null;

  return (
    <aside className="w-56 bg-white border-l border-gray-200 flex flex-col overflow-hidden shrink-0">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {activePlan && (
          renderMode === '3d' ? (
            <ThreeDSettings plan={activePlan} />
          ) : (
            <>
              {hasObjectSelection && <ObjectInspector plan={activePlan} />}
              {hasZoneSelection && <ZoneInspector plan={activePlan} />}
              {!hasObjectSelection && !hasZoneSelection && <PlanSettings plan={activePlan} />}
            </>
          )
        )}
      </div>
    </aside>
  );
}
