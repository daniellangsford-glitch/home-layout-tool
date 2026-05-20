import { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { PlanForm } from './PlanForm';
import type { Plan } from '../../types/plan';

export function PlanList() {
  const project = useProjectStore((s) => s.project);
  const setActivePlan = useProjectStore((s) => s.setActivePlan);
  const storeActivePlanId = useProjectStore((s) => s.activePlanId);
  const deletePlan = useProjectStore((s) => s.deletePlan);
  const duplicatePlan = useProjectStore((s) => s.duplicatePlan);
  const [showNewPlan, setShowNewPlan] = useState(false);

  const plans = project.plans;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plans</span>
        <Button variant="primary" size="sm" onClick={() => setShowNewPlan(true)}>+ New Plan</Button>
      </div>

      {plans.map((plan) => (
        <PlanItem
          key={plan.id}
          plan={plan}
          isActive={plan.id === storeActivePlanId || (!storeActivePlanId && plan === plans[0])}
          onSelect={() => setActivePlan(plan.id)}
          onDuplicate={() => duplicatePlan(plan.id)}
          onDelete={() => plans.length > 1 && deletePlan(plan.id)}
        />
      ))}

      {showNewPlan && (
        <Modal title="New Plan" onClose={() => setShowNewPlan(false)}>
          <PlanForm onComplete={() => setShowNewPlan(false)} />
        </Modal>
      )}
    </div>
  );
}

function PlanItem({
  plan,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  plan: Plan;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-1 p-1.5 rounded cursor-pointer group ${
        isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
      }`}
      onClick={onSelect}
    >
      <span className={`flex-1 text-sm truncate ${isActive ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
        {plan.name}
      </span>
      <span className="text-xs text-gray-400 shrink-0">{plan.viewMode === 'topDown' ? '↓' : '→'}</span>
      <div className="hidden group-hover:flex gap-0.5">
        <button
          className="text-gray-400 hover:text-gray-600 px-0.5 text-xs"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          title="Duplicate"
        >⎘</button>
        <button
          className="text-gray-400 hover:text-red-500 px-0.5 text-xs"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
        >✕</button>
      </div>
    </div>
  );
}
