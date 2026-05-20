import { useProjectStore } from '../../stores/projectStore';
import { getPresetsForViewMode } from '../../data/presets';
import type { Plan } from '../../types/plan';
import type { LayoutObject } from '../../types/layoutObject';

type Props = {
  plan: Plan;
};

export function ObjectLibrary({ plan }: Props) {
  const addObject = useProjectStore((s) => s.addObject);
  const presets = getPresetsForViewMode(plan.viewMode);

  const handleAdd = (presetIndex: number) => {
    const preset = presets[presetIndex];
    const existingCount = plan.objects.filter((o) => o.name.startsWith(preset.name)).length;
    const object: Omit<LayoutObject, 'id'> = {
      planId: plan.id,
      name: existingCount > 0 ? `${preset.name} ${existingCount + 1}` : preset.name,
      shape: preset.shape,
      x: 2,
      y: 2,
      width: preset.width,
      height: preset.height,
      rotation: 0,
      fill: preset.fill,
      stroke: preset.stroke,
      strokeWidth: 1,
      opacity: 1,
      locked: false,
      visible: true,
      layerIndex: plan.objects.length,
      viewCompatibility: preset.viewCompatibility,
    };
    addObject(plan.id, object);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Objects</div>
      <div className="flex flex-col gap-0.5">
        {presets.map((preset, i) => (
          <button
            key={i}
            onClick={() => handleAdd(i)}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span
              className="w-4 h-4 rounded-sm border border-gray-300 shrink-0"
              style={{ background: preset.fill }}
            />
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
