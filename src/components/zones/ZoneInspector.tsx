import { useProjectStore } from '../../stores/projectStore';
import { useCanvasStore } from '../../stores/canvasStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { NumberInput } from '../ui/NumberInput';
import { ColorPicker } from '../ui/ColorPicker';
import type { Plan } from '../../types/plan';

type Props = {
  plan: Plan;
};

export function ZoneInspector({ plan }: Props) {
  const selectedZoneId = useCanvasStore((s) => s.selectedZoneId);
  const editingZoneId = useCanvasStore((s) => s.editingZoneId);
  const selectedZonePointIndex = useCanvasStore((s) => s.selectedZonePointIndex);
  const setEditingZone = useCanvasStore((s) => s.setEditingZone);
  const setSelectedZonePoint = useCanvasStore((s) => s.setSelectedZonePoint);
  const clearSelection = useCanvasStore((s) => s.clearSelection);

  const updateZone = useProjectStore((s) => s.updateZone);
  const deleteZone = useProjectStore((s) => s.deleteZone);
  const moveZonePoint = useProjectStore((s) => s.moveZonePoint);
  const removeZonePoint = useProjectStore((s) => s.removeZonePoint);

  const zone = (plan.zones ?? []).find((z) => z.id === selectedZoneId);
  if (!zone) return null;

  const isEditing = editingZoneId === zone.id;
  const selectedPoint = selectedZonePointIndex !== null ? zone.points[selectedZonePointIndex] : null;

  const update = (updates: Partial<typeof zone>) => updateZone(plan.id, zone.id, updates);

  if (isEditing && selectedPoint !== null && selectedZonePointIndex !== null) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Corner {selectedZonePointIndex + 1}
          </div>
          <button
            onClick={() => setEditingZone(null)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Done
          </button>
        </div>
        <NumberInput
          label="X"
          step={0.1}
          value={Math.round(selectedPoint.x * 10) / 10}
          onChange={(x) => moveZonePoint(plan.id, zone.id, selectedZonePointIndex, { ...selectedPoint, x })}
        />
        <NumberInput
          label="Y"
          step={0.1}
          value={Math.round(selectedPoint.y * 10) / 10}
          onChange={(y) => moveZonePoint(plan.id, zone.id, selectedZonePointIndex, { ...selectedPoint, y })}
        />
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            removeZonePoint(plan.id, zone.id, selectedZonePointIndex);
            setSelectedZonePoint(null);
          }}
          disabled={zone.points.length <= 3}
        >
          Remove Corner
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Zone</div>

      <Input
        label="Name"
        value={zone.name}
        onChange={(e) => update({ name: e.target.value })}
      />

      <ColorPicker label="Fill" value={zone.fill} onChange={(v) => update({ fill: v })} />
      <ColorPicker label="Border" value={zone.stroke} onChange={(v) => update({ stroke: v })} />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Opacity</label>
        <input
          type="range"
          min={0.05}
          max={0.9}
          step={0.05}
          value={zone.opacity}
          onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{Math.round(zone.opacity * 100)}%</span>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={zone.visible}
          onChange={(e) => update({ visible: e.target.checked })}
        />
        Visible
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={zone.showDimensions ?? false}
          onChange={(e) => update({ showDimensions: e.target.checked })}
        />
        Show dimensions
      </label>

      <div className="border-t pt-3 flex flex-col gap-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shape</div>
        <Button
          variant={isEditing ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setEditingZone(isEditing ? null : zone.id)}
        >
          {isEditing ? '✓ Done Editing Shape' : 'Edit Zone Shape'}
        </Button>
        <p className="text-xs text-gray-400">
          {zone.points.length} corners
        </p>
      </div>

      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          deleteZone(plan.id, zone.id);
          clearSelection();
        }}
      >
        Delete Zone
      </Button>
    </div>
  );
}
