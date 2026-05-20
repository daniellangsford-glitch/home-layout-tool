import React from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useCanvasStore } from '../../stores/canvasStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { NumberInput } from '../ui/NumberInput';
import { Select } from '../ui/Select';
import { formatMeasurement } from '../../lib/scale';
import type { Plan } from '../../types/plan';

type Props = {
  plan: Plan;
};

export function PlanSettings({ plan }: Props) {
  const updatePlan = useProjectStore((s) => s.updatePlan);
  const resetBoundary = useProjectStore((s) => s.resetBoundaryToRectangle);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const clearSelection = useCanvasStore((s) => s.clearSelection);

  const isEditMode = activeTool === 'editBoundary';

  const update = (field: string, value: unknown) => {
    updatePlan(plan.id, { [field]: value });
  };

  const toggleBoundaryEdit = () => {
    if (isEditMode) {
      setActiveTool('select');
      clearSelection();
    } else {
      setActiveTool('editBoundary');
      clearSelection();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Settings</div>

      <Input
        label="Plan Name"
        value={plan.name}
        onChange={(e) => update('name', e.target.value)}
      />

      <Select
        label="Type"
        value={plan.type}
        onChange={(e) => update('type', e.target.value)}
        options={[
          { value: 'floor', label: 'Floor Plan' },
          { value: 'room', label: 'Room' },
          { value: 'backyard', label: 'Backyard' },
          { value: 'garage', label: 'Garage' },
          { value: 'custom', label: 'Custom' },
        ]}
      />

      <Select
        label="View Mode"
        value={plan.viewMode}
        onChange={(e) => update('viewMode', e.target.value as Plan['viewMode'])}
        options={[
          { value: 'topDown', label: 'Top-Down' },
          { value: 'sideView', label: 'Side View' },
        ]}
      />

      <Select
        label="Unit"
        value={plan.unit}
        onChange={(e) => update('unit', e.target.value)}
        options={[
          { value: 'ft', label: 'Feet (ft)' },
          { value: 'in', label: 'Inches (in)' },
          { value: 'm', label: 'Meters (m)' },
          { value: 'cm', label: 'Centimeters (cm)' },
        ]}
      />

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Width"
          value={plan.width}
          step={0.5}
          onChange={(v) => update('width', v)}
        />
        <NumberInput
          label="Height"
          value={plan.height}
          step={0.5}
          onChange={(v) => update('height', v)}
        />
      </div>

      <NumberInput
        label="Scale (px per unit)"
        value={plan.pixelsPerUnit}
        min={5}
        max={100}
        onChange={(v) => update('pixelsPerUnit', v)}
      />

      <div className="border-t pt-3 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Layout Shape</div>
        <Button
          variant={isEditMode ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggleBoundaryEdit}
        >
          {isEditMode ? '✓ Done Editing Shape' : 'Edit Layout Shape'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => resetBoundary(plan.id)}
        >
          Reset to Rectangle
        </Button>
      </div>

      <div className="border-t pt-3 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Grid</div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={plan.grid.visible}
            onChange={(e) => update('grid', { ...plan.grid, visible: e.target.checked })}
            className="rounded"
          />
          Show Grid
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={plan.grid.snapEnabled}
            onChange={(e) => update('grid', { ...plan.grid, snapEnabled: e.target.checked })}
            className="rounded"
          />
          Snap to Grid
        </label>
        <Input
          label="Grid Size"
          type="number"
          value={plan.grid.size}
          step="0.5"
          min="0.1"
          onChange={(e) =>
            update('grid', { ...plan.grid, size: parseFloat(e.target.value) || plan.grid.size })
          }
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Grid Opacity</label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={plan.grid.opacity ?? 1}
            onChange={(e) => update('grid', { ...plan.grid, opacity: parseFloat(e.target.value) })}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{Math.round((plan.grid.opacity ?? 1) * 100)}%</span>
        </div>
      </div>

      <div className="border-t pt-3 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dimensions</div>
        {([
          ['showOnBoundary', 'Layout boundary'],
          ['showOnZones', 'Zones'],
          ['showOnObjects', 'Objects'],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={plan.dimensions?.[key] ?? false}
              onChange={(e) =>
                update('dimensions', { ...(plan.dimensions ?? {}), [key]: e.target.checked })
              }
              className="rounded"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
