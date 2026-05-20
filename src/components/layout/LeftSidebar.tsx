import React from 'react';
import { PlanList } from '../plans/PlanList';
import { DrawTools } from '../objects/DrawTools';
import { ObjectPanel } from '../objects/ObjectPanel';
import { ZonePanel } from '../zones/ZonePanel';
import type { Plan } from '../../types/plan';

type Props = {
  activePlan: Plan | null;
};

export function LeftSidebar({ activePlan }: Props) {
  return (
    <aside className="w-52 bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        <PlanList />
        {activePlan && (
          <>
            <div className="border-t pt-3">
              <DrawTools plan={activePlan} />
            </div>
            <div className="border-t pt-3">
              <ZonePanel plan={activePlan} />
            </div>
            <div className="border-t pt-3">
              <ObjectPanel plan={activePlan} />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
