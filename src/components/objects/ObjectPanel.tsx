import React from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';
import type { Plan } from '../../types/plan';
import type { LayoutObject } from '../../types/layoutObject';

type Props = {
  plan: Plan;
};

const SHAPE_ICONS: Record<string, string> = {
  rectangle: '▭',
  circle: '○',
  ellipse: '⬭',
  text: 'T',
  line: '/',
};

export function ObjectPanel({ plan }: Props) {
  const selectedObjectIds = useCanvasStore((s) => s.selectedObjectIds);
  const setSelectedObject = useCanvasStore((s) => s.setSelectedObject);
  const toggleSelectObject = useCanvasStore((s) => s.toggleSelectObject);
  const updateObject = useProjectStore((s) => s.updateObject);

  const objects = [...plan.objects].sort((a, b) => b.layerIndex - a.layerIndex);

  if (objects.length === 0) return null;

  const handleClick = (e: React.MouseEvent, obj: LayoutObject) => {
    if (e.shiftKey) toggleSelectObject(obj.id);
    else setSelectedObject(obj.id);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Objects <span className="font-normal normal-case text-gray-400">({objects.length})</span>
      </div>
      {objects.map((obj) => {
        const isSelected = selectedObjectIds.includes(obj.id);
        return (
          <div
            key={obj.id}
            className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors group ${
              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={(e) => handleClick(e, obj)}
          >
            {/* Color swatch */}
            <span
              className="w-3 h-3 rounded-sm border shrink-0"
              style={{
                background: obj.shape === 'text' ? 'transparent' : obj.fill,
                borderColor: obj.shape === 'text' ? obj.fill : obj.stroke,
                opacity: obj.visible ? 1 : 0.35,
                color: obj.fill,
                fontSize: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {obj.shape === 'text' ? 'T' : ''}
            </span>

            {/* Name */}
            <span
              className={`text-xs flex-1 truncate ${
                isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'
              } ${!obj.visible ? 'opacity-40' : ''} ${obj.locked ? 'italic' : ''}`}
            >
              {obj.name || `${obj.shape}`}
            </span>

            {/* Lock indicator */}
            {obj.locked && (
              <span className="text-gray-300 text-xs shrink-0">🔒</span>
            )}

            {/* Visibility toggle */}
            <button
              className="text-gray-400 hover:text-gray-600 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title={obj.visible ? 'Hide' : 'Show'}
              onClick={(e) => {
                e.stopPropagation();
                updateObject(plan.id, obj.id, { visible: !obj.visible });
              }}
            >
              {obj.visible ? '◉' : '○'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
