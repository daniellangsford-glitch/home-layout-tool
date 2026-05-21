import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';
import { NumberInput } from '../ui/NumberInput';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import type { Plan, MeasurementUnit } from '../../types/plan';

function unitDefaultWallHeight(unit: MeasurementUnit): number {
  return unit === 'm' ? 2.4 : unit === 'cm' ? 240 : unit === 'ft' ? 8 : 96;
}

type Props = { plan: Plan };

export function ThreeDSettings({ plan }: Props) {
  const wallOpacity = useCanvasStore((s) => s.wallOpacity);
  const wallHeightEditMode = useCanvasStore((s) => s.wallHeightEditMode);
  const selectedWallPointIndex = useCanvasStore((s) => s.selectedWallPointIndex);
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const selectedZoneId = useCanvasStore((s) => s.selectedZoneId);
  const setWallOpacity = useCanvasStore((s) => s.setWallOpacity);
  const setWallHeightEditMode = useCanvasStore((s) => s.setWallHeightEditMode);
  const setSelectedWallPoint = useCanvasStore((s) => s.setSelectedWallPoint);
  const setWallHeight = useProjectStore((s) => s.setWallHeight);
  const setPointHeight = useProjectStore((s) => s.setPointHeight);
  const addBoundaryPointWithHeight = useProjectStore((s) => s.addBoundaryPointWithHeight);
  const setFloorColor = useProjectStore((s) => s.setFloorColor);
  const setWallColor = useProjectStore((s) => s.setWallColor);
  const setSegmentWallColor = useProjectStore((s) => s.setSegmentWallColor);
  const setObjectPointHeight = useProjectStore((s) => s.setObjectPointHeight);
  const addObjectFootprintStep = useProjectStore((s) => s.addObjectFootprintStep);
  const removeObjectFootprintPoint = useProjectStore((s) => s.removeObjectFootprintPoint);
  const updateObject = useProjectStore((s) => s.updateObject);
  const objectHeightEditMode = useCanvasStore((s) => s.objectHeightEditMode);
  const selectedObjectPointIndex = useCanvasStore((s) => s.selectedObjectPointIndex);
  const setObjectHeightEditMode = useCanvasStore((s) => s.setObjectHeightEditMode);
  const setSelectedObjectPoint = useCanvasStore((s) => s.setSelectedObjectPoint);

  const selectedObject =
    selectedObjectIds.length === 1
      ? plan.objects.find((o) => o.id === selectedObjectIds[0]) ?? null
      : null;
  const selectedZone = selectedZoneId ? plan.zones?.find((z) => z.id === selectedZoneId) : null;
  const selectedCornerHeight = selectedWallPointIndex !== null
    ? (plan.boundary.pointHeights?.[selectedWallPointIndex] ?? plan.wallHeight ?? unitDefaultWallHeight(plan.unit))
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">3D View</div>

      {/* Floor colour */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-gray-600">Floor</div>
        <ColorPicker
          label="Floor Colour"
          value={plan.floorColor ?? '#f8fafc'}
          onChange={(c) => setFloorColor(plan.id, c)}
        />
      </div>

      {/* Wall settings */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-gray-600">Walls</div>

        <ColorPicker
          label="Wall Colour"
          value={plan.wallColor ?? '#e2e8f0'}
          onChange={(c) => setWallColor(plan.id, c)}
        />

        <NumberInput
          label={`Default Height (${plan.unit})`}
          value={plan.wallHeight ?? unitDefaultWallHeight(plan.unit)}
          min={0}
          step={0.1}
          onChange={(v) => setWallHeight(plan.id, v)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Wall Opacity</label>
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={wallOpacity}
            onChange={(e) => setWallOpacity(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{Math.round(wallOpacity * 100)}%</span>
        </div>

        <Button
          variant={wallHeightEditMode ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setWallHeightEditMode(!wallHeightEditMode)}
        >
          {wallHeightEditMode ? '✓ Done Editing Heights' : 'Edit Wall Heights'}
        </Button>

        <p className="text-xs text-gray-400 leading-tight">
          {wallHeightEditMode
            ? 'Drag the blue/grey handles on each corner to set wall height. 0 = no wall.'
            : 'Enable to drag corner handles and set wall heights.'}
        </p>
      </div>

      {/* Selected wall corner */}
      {wallHeightEditMode && selectedWallPointIndex !== null && selectedCornerHeight !== null && (
        <div className="border-t pt-3 flex flex-col gap-2">
          <div className="text-xs font-medium text-gray-600">Corner {selectedWallPointIndex + 1}</div>
          <NumberInput
            label={`Height (${plan.unit})`}
            value={Math.round(selectedCornerHeight * 100) / 100}
            min={0}
            step={0.1}
            onChange={(v) => setPointHeight(plan.id, selectedWallPointIndex, v)}
          />
          <ColorPicker
            label={`Wall ${selectedWallPointIndex + 1}→${(selectedWallPointIndex + 1) % plan.boundary.points.length + 1} Colour`}
            value={plan.boundary.wallColors?.[selectedWallPointIndex] ?? plan.wallColor ?? '#e2e8f0'}
            onChange={(c) => setSegmentWallColor(plan.id, selectedWallPointIndex, c)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSegmentWallColor(plan.id, selectedWallPointIndex, null)}
          >
            Reset to Default Colour
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // Insert a new corner at the same X/Z position right after this one.
              // This creates a vertical wall face (step) between the two heights —
              // useful for transitions like house wall (8ft) → fence (4ft).
              const pt = plan.boundary.points[selectedWallPointIndex];
              addBoundaryPointWithHeight(plan.id, selectedWallPointIndex, { x: pt.x, y: pt.y }, 0);
            }}
          >
            Add Step Here
          </Button>
          <p className="text-xs text-gray-400 leading-tight">
            Inserts a new corner at the same position to create a sharp height change (e.g. house wall → fence).
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPointHeight(plan.id, selectedWallPointIndex, null);
            }}
          >
            Reset to Default
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedWallPoint(null)}
          >
            Deselect
          </Button>
        </div>
      )}

      {/* Selected object */}
      {selectedObject && (
        <div className="border-t pt-3 flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Selected Object
          </div>
          <div className="text-sm font-medium text-gray-700 truncate">{selectedObject.name}</div>
          <div className="text-xs text-gray-500">
            {Math.round(selectedObject.width * 10) / 10} × {Math.round(selectedObject.height * 10) / 10} {plan.unit}
          </div>
          <NumberInput
            label={`3D Height (${plan.unit})`}
            value={selectedObject.height3d ?? (plan.unit === 'm' ? 0.75 : plan.unit === 'ft' ? 2.5 : 30)}
            min={0.05}
            step={0.1}
            onChange={(v) => updateObject(plan.id, selectedObject.id, { height3d: v })}
          />
          <NumberInput
            label={`Elevation (${plan.unit})`}
            value={selectedObject.elevation ?? 0}
            min={0}
            step={0.1}
            onChange={(v) => updateObject(plan.id, selectedObject.id, { elevation: v })}
          />

          {selectedObject.shape === 'rectangle' && (
            <>
              <Button
                variant={objectHeightEditMode ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setObjectHeightEditMode(!objectHeightEditMode)}
              >
                {objectHeightEditMode ? '✓ Done Editing Shape' : 'Edit Object Shape'}
              </Button>
              <p className="text-xs text-gray-400 leading-tight">
                {objectHeightEditMode
                  ? 'Drag corner handles to set height. Click edge handles to add a step.'
                  : 'Enable to drag corner handles and shape the object in 3D.'}
              </p>
              {objectHeightEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateObject(plan.id, selectedObject.id, { cornerHeights: undefined, footprint3d: undefined })}
                >
                  Reset Shape
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Selected object corner */}
      {objectHeightEditMode && selectedObject?.shape === 'rectangle' && selectedObjectPointIndex !== null && (() => {
        const baseH = selectedObject.height3d ?? (plan.unit === 'm' ? 0.75 : plan.unit === 'ft' ? 2.5 : 30);
        const fp = selectedObject.footprint3d && selectedObject.footprint3d.length >= 3
          ? selectedObject.footprint3d
          : [
              { x: selectedObject.x, y: selectedObject.y },
              { x: selectedObject.x + selectedObject.width, y: selectedObject.y },
              { x: selectedObject.x + selectedObject.width, y: selectedObject.y + selectedObject.height },
              { x: selectedObject.x, y: selectedObject.y + selectedObject.height },
            ];
        const currentH = selectedObject.cornerHeights?.[selectedObjectPointIndex] ?? baseH;
        const canRemove = fp.length > 3;
        return (
          <div className="border-t pt-3 flex flex-col gap-2">
            <div className="text-xs font-medium text-gray-600">Corner {selectedObjectPointIndex + 1}</div>
            <NumberInput
              label={`Height (${plan.unit})`}
              value={Math.round(currentH * 100) / 100}
              min={0}
              step={0.1}
              onChange={(v) => setObjectPointHeight(plan.id, selectedObject.id, selectedObjectPointIndex, v)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => addObjectFootprintStep(plan.id, selectedObject.id, selectedObjectPointIndex)}
            >
              Add Step Here
            </Button>
            <p className="text-xs text-gray-400 leading-tight">
              Inserts a corner at the same position with height 0, creating a sharp vertical face.
            </p>
            {canRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeObjectFootprintPoint(plan.id, selectedObject.id, selectedObjectPointIndex);
                  setSelectedObjectPoint(null);
                }}
              >
                Remove Corner
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedObjectPoint(null)}>
              Deselect
            </Button>
          </div>
        );
      })()}

      {/* Selected zone */}
      {selectedZone && (
        <div className="border-t pt-3 flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Selected Zone
          </div>
          <div className="text-sm font-medium text-gray-700 truncate">{selectedZone.name}</div>
          <div className="text-xs text-gray-500">
            Click anywhere else to deselect
          </div>
        </div>
      )}
    </div>
  );
}
