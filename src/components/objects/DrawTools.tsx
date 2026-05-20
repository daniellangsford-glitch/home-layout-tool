import React from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';
import type { Plan } from '../../types/plan';
import type { LayoutObject } from '../../types/layoutObject';

type Props = {
  plan: Plan;
};

export const ZONE_COLORS = ['#bfdbfe', '#bbf7d0', '#fde68a', '#e9d5ff', '#fed7aa', '#fecdd3'];
export const ZONE_STROKES = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#f97316', '#f43f5e'];

export function DrawTools({ plan }: Props) {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const userPresets = useProjectStore((s) => s.project.userPresets ?? []);
  const addObject = useProjectStore((s) => s.addObject);
  const removeUserPreset = useProjectStore((s) => s.removeUserPreset);

  const isDrawRect = activeTool === 'drawRectangle';
  const isDrawCircle = activeTool === 'drawCircle';
  const isDrawZone = activeTool === 'drawZone';
  const isPlaceLabel = activeTool === 'placeLabel';
  const isAnyDrawActive = isDrawRect || isDrawCircle || isDrawZone;

  const toggleTool = (tool: 'drawRectangle' | 'drawCircle' | 'drawZone') => {
    setActiveTool(activeTool === tool ? 'select' : tool);
  };

  const addPresetToCanvas = (presetId: string) => {
    const preset = userPresets.find((p) => p.id === presetId);
    if (!preset) return;
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
      strokeWidth: preset.strokeWidth,
      opacity: preset.opacity,
      locked: false,
      visible: true,
      layerIndex: plan.objects.length,
      viewCompatibility: 'both',
    };
    addObject(plan.id, object);
  };

  const isSelect = activeTool === 'select';

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</div>

      <div className="flex flex-col gap-0.5">
        <ToolButton active={isSelect} onClick={() => setActiveTool('select')}>
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M3 2l10 5.5-4.5 1.5-2 4.5L3 2z" fill={isSelect ? '#2563eb' : '#6b7280'} />
          </svg>
          Select
        </ToolButton>

        <ToolButton active={isDrawRect} onClick={() => toggleTool('drawRectangle')}>
          <span className="w-4 h-4 border-2 rounded-sm shrink-0" style={{ borderColor: isDrawRect ? '#2563eb' : '#9ca3af' }} />
          Rectangle
        </ToolButton>

        <ToolButton active={isDrawCircle} onClick={() => toggleTool('drawCircle')}>
          <span className="w-4 h-4 border-2 rounded-full shrink-0" style={{ borderColor: isDrawCircle ? '#2563eb' : '#9ca3af' }} />
          Circle
        </ToolButton>

        <ToolButton active={isDrawZone} onClick={() => toggleTool('drawZone')}>
          <span
            className="w-4 h-4 rounded-sm shrink-0 border-2"
            style={{ background: '#bfdbfe', borderColor: isDrawZone ? '#2563eb' : '#9ca3af' }}
          />
          Zone
        </ToolButton>

        <ToolButton active={isPlaceLabel} onClick={() => setActiveTool(isPlaceLabel ? 'select' : 'placeLabel')}>
          <span
            className="w-4 h-4 shrink-0 flex items-center justify-center text-xs font-bold leading-none"
            style={{ color: isPlaceLabel ? '#2563eb' : '#6b7280' }}
          >
            T
          </span>
          Label
        </ToolButton>
      </div>

      {isAnyDrawActive && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
          Click and drag on the canvas to draw
        </p>
      )}
      {isPlaceLabel && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
          Click on the canvas to place a label
        </p>
      )}

      {userPresets.length > 0 && (
        <>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Saved Shapes</div>
          <div className="flex flex-col gap-0.5">
            {userPresets.map((preset) => (
              <div key={preset.id} className="flex items-center gap-1 group">
                <button
                  onClick={() => addPresetToCanvas(preset.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex-1 min-w-0"
                >
                  <span
                    className={`w-4 h-4 shrink-0 border border-gray-300 ${preset.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
                    style={{ background: preset.fill }}
                  />
                  <span className="truncate">{preset.name}</span>
                </button>
                <button
                  onClick={() => removeUserPreset(preset.id)}
                  className="opacity-0 group-hover:opacity-100 px-1 py-1 text-gray-400 hover:text-red-500 transition-opacity text-xs"
                  title="Remove preset"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ToolButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
        active ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}
