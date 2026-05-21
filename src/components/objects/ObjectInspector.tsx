import { useProjectStore } from '../../stores/projectStore';
import { useCanvasStore } from '../../stores/canvasStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { NumberInput } from '../ui/NumberInput';
import { ColorPicker } from '../ui/ColorPicker';
import type { Plan } from '../../types/plan';
import type { LayoutObject } from '../../types/layoutObject';

type Props = {
  plan: Plan;
};

export function ObjectInspector({ plan }: Props) {
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const selectedBoundaryPointIndex = useCanvasStore((s) => s.selectedBoundaryPointIndex);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const updateObject = useProjectStore((s) => s.updateObject);
  const deleteObject = useProjectStore((s) => s.deleteObject);
  const duplicateObject = useProjectStore((s) => s.duplicateObject);
  const moveBoundaryPoint = useProjectStore((s) => s.moveBoundaryPoint);
  const removeBoundaryPoint = useProjectStore((s) => s.removeBoundaryPoint);
  const saveUserPreset = useProjectStore((s) => s.saveUserPreset);

  // For single-select inspector
  const singleId = selectedObjectIds.length === 1 ? selectedObjectIds[0] : null;
  const selectedObject = singleId ? plan.objects.find((o) => o.id === singleId) : null;
  const selectedBoundaryPoint =
    selectedBoundaryPointIndex !== null
      ? plan.boundary.points[selectedBoundaryPointIndex]
      : null;

  const update = (updates: Partial<LayoutObject>) => {
    if (!singleId) return;
    updateObject(plan.id, singleId, updates);
  };

  if (selectedBoundaryPoint !== null && selectedBoundaryPointIndex !== null) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Corner Point {selectedBoundaryPointIndex + 1}
        </div>
        <NumberInput
          label="X"
          step={0.1}
          value={selectedBoundaryPoint.x}
          onChange={(x) => moveBoundaryPoint(plan.id, selectedBoundaryPointIndex, { ...selectedBoundaryPoint, x })}
        />
        <NumberInput
          label="Y"
          step={0.1}
          value={selectedBoundaryPoint.y}
          onChange={(y) => moveBoundaryPoint(plan.id, selectedBoundaryPointIndex, { ...selectedBoundaryPoint, y })}
        />
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            removeBoundaryPoint(plan.id, selectedBoundaryPointIndex);
            clearSelection();
          }}
          disabled={plan.boundary.points.length <= 3}
        >
          Remove Corner
        </Button>
      </div>
    );
  }

  if (!selectedObject) {
    return (
      <div className="text-sm text-gray-400 text-center py-4">
        Select an object to edit its properties
      </div>
    );
  }

  // Multi-select panel
  if (selectedObjectIds.length > 1) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selection</div>
        <p className="text-sm text-gray-600">{selectedObjectIds.length} objects selected</p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => {
              selectedObjectIds.forEach((id) => duplicateObject(plan.id, id));
            }}
          >
            Duplicate All
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              selectedObjectIds.forEach((id) => deleteObject(plan.id, id));
              clearSelection();
            }}
          >
            Delete All
          </Button>
        </div>
      </div>
    );
  }

  const isText = selectedObject.shape === 'text';

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {isText ? 'Label' : 'Object'}
      </div>

      <Input
        label={isText ? 'Text' : 'Name'}
        value={selectedObject.name}
        onChange={(e) => update({ name: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="X"
          step={0.1}
          value={Math.round(selectedObject.x * 10) / 10}
          onChange={(v) => update({ x: v })}
        />
        <NumberInput
          label="Y"
          step={0.1}
          value={Math.round(selectedObject.y * 10) / 10}
          onChange={(v) => update({ y: v })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Width"
          step={0.1}
          min={0.1}
          value={Math.round(selectedObject.width * 10) / 10}
          onChange={(v) => update({ width: v })}
        />
        <NumberInput
          label="Height"
          step={0.1}
          min={0.1}
          value={Math.round(selectedObject.height * 10) / 10}
          onChange={(v) => update({ height: v })}
        />
      </div>

      {!isText && (
        <>
          <NumberInput
            label="3D Height"
            step={0.1}
            min={0.05}
            value={Math.round((selectedObject.height3d ?? 0.75) * 10) / 10}
            onChange={(v) => update({ height3d: v })}
          />
          <NumberInput
            label="Elevation (3D floor offset)"
            step={0.1}
            min={0}
            value={Math.round((selectedObject.elevation ?? 0) * 10) / 10}
            onChange={(v) => update({ elevation: v })}
          />
        </>
      )}

      {isText ? (
        <>
          <NumberInput
            label="Font Size"
            step={1}
            min={6}
            value={selectedObject.fontSize ?? 14}
            onChange={(v) => update({ fontSize: v })}
          />
          <ColorPicker label="Color" value={selectedObject.fill} onChange={(v) => update({ fill: v })} />
        </>
      ) : (
        <>
          <ColorPicker label="Fill" value={selectedObject.fill} onChange={(v) => update({ fill: v })} />
          <ColorPicker label="Stroke" value={selectedObject.stroke} onChange={(v) => update({ stroke: v })} />
        </>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Opacity</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={selectedObject.opacity}
          onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{Math.round(selectedObject.opacity * 100)}%</span>
      </div>

      <div className="flex gap-2">
        <label className="flex items-center gap-2 text-sm flex-1">
          <input
            type="checkbox"
            checked={selectedObject.locked}
            onChange={(e) => update({ locked: e.target.checked })}
          />
          Locked
        </label>
        <label className="flex items-center gap-2 text-sm flex-1">
          <input
            type="checkbox"
            checked={selectedObject.visible}
            onChange={(e) => update({ visible: e.target.checked })}
          />
          Visible
        </label>
      </div>

      {!isText && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selectedObject.showDimensions ?? false}
            onChange={(e) => update({ showDimensions: e.target.checked })}
          />
          Show dimensions
        </label>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={selectedObject.snapDisabled ?? false}
          onChange={(e) => update({ snapDisabled: e.target.checked })}
        />
        Ignore grid snap
      </label>

      <div className="flex gap-2 pt-1">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => duplicateObject(plan.id, selectedObject.id)}
        >
          Duplicate
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            deleteObject(plan.id, selectedObject.id);
            clearSelection();
          }}
        >
          Delete
        </Button>
      </div>

      {(selectedObject.shape === 'rectangle' || selectedObject.shape === 'circle') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            saveUserPreset({
              name: selectedObject.name,
              shape: selectedObject.shape as 'rectangle' | 'circle',
              width: selectedObject.width,
              height: selectedObject.height,
              fill: selectedObject.fill,
              stroke: selectedObject.stroke,
              strokeWidth: selectedObject.strokeWidth,
              opacity: selectedObject.opacity,
            })
          }
        >
          Save as Preset
        </Button>
      )}
    </div>
  );
}
