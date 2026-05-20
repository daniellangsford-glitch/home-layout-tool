import React, { useRef } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../ui/Button';
import type { Plan } from '../../types/plan';
import Konva from 'konva';

type Props = {
  activePlan: Plan | null;
  stageRef: React.RefObject<Konva.Stage | null>;
};

export function Header({ activePlan, stageRef }: Props) {
  const project = useProjectStore((s) => s.project);
  const saveState = useProjectStore((s) => s.saveState);
  const past = useProjectStore((s) => s.past);
  const future = useProjectStore((s) => s.future);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const exportProject = useProjectStore((s) => s.exportProject);
  const importProject = useProjectStore((s) => s.importProject);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveLabels: Record<string, string> = {
    saved: '✓ Saved',
    saving: 'Saving...',
    unsaved: '● Unsaved',
    error: '✕ Save Error',
  };
  const saveColors: Record<string, string> = {
    saved: 'text-green-600',
    saving: 'text-blue-500',
    unsaved: 'text-amber-500',
    error: 'text-red-500',
  };

  const handleExportPNG = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `${activePlan?.name ?? 'plan'}.png`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importProject(ev.target?.result as string);
      } catch (err) {
        alert(`Failed to import: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="flex items-center h-11 px-4 bg-white border-b border-gray-200 gap-4 shrink-0">
      <span className="font-semibold text-gray-800 text-sm">House Layout Planner</span>
      {activePlan && (
        <span className="text-sm text-gray-500">
          {activePlan.name} — {activePlan.width} × {activePlan.height} {activePlan.unit}
          {' '}({activePlan.viewMode === 'topDown' ? 'Top-Down' : 'Side View'})
        </span>
      )}
      <div className="flex-1" />
      <span className={`text-xs font-medium ${saveColors[saveState]}`}>{saveLabels[saveState]}</span>
      <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
        <button
          onClick={undo}
          disabled={past.length === 0}
          title="Undo (Ctrl+Z)"
          className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 7H10C11.66 7 13 8.34 13 10C13 11.66 11.66 13 10 13H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5 4.5L2.5 7L5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          title="Redo (Ctrl+Y)"
          className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 7H6C4.34 7 3 8.34 3 10C3 11.66 4.34 13 6 13H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M11 4.5L13.5 7L11 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>Import JSON</Button>
      <Button variant="ghost" size="sm" onClick={exportProject}>Export JSON</Button>
      <Button variant="secondary" size="sm" onClick={handleExportPNG}>Export PNG</Button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </header>
  );
}
