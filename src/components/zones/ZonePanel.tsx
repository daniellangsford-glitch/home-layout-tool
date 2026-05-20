import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';
import type { Plan } from '../../types/plan';

type Props = {
  plan: Plan;
};

export function ZonePanel({ plan }: Props) {
  const selectedZoneId = useCanvasStore((s) => s.selectedZoneId);
  const editingZoneId = useCanvasStore((s) => s.editingZoneId);
  const setSelectedZone = useCanvasStore((s) => s.setSelectedZone);
  const setEditingZone = useCanvasStore((s) => s.setEditingZone);
  const updateZone = useProjectStore((s) => s.updateZone);

  const zones = plan.zones ?? [];

  if (zones.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Zones</div>
      {zones.map((zone) => {
        const isSelected = selectedZoneId === zone.id;
        const isEditing = editingZoneId === zone.id;
        return (
          <div
            key={zone.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => {
              if (isEditing) setEditingZone(null);
              setSelectedZone(zone.id);
            }}
          >
            <span
              className="w-3 h-3 rounded-sm border shrink-0"
              style={{
                background: zone.fill,
                borderColor: zone.stroke,
                opacity: zone.visible ? 1 : 0.4,
              }}
            />
            <span className={`text-sm flex-1 truncate ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'} ${!zone.visible ? 'opacity-40' : ''}`}>
              {zone.name || 'Unnamed zone'}
            </span>
            <button
              className="text-gray-400 hover:text-gray-600 text-xs shrink-0"
              title={zone.visible ? 'Hide zone' : 'Show zone'}
              onClick={(e) => {
                e.stopPropagation();
                updateZone(plan.id, zone.id, { visible: !zone.visible });
              }}
            >
              {zone.visible ? '◉' : '○'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
