import { useRef, useEffect } from 'react';
import Konva from 'konva';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { BottomBar } from './BottomBar';
import { LayoutCanvas } from '../canvas/LayoutCanvas';
import { ThreeDCanvas } from '../canvas3d/ThreeDCanvas';
import { useProjectStore } from '../../stores/projectStore';
import { useCanvasStore } from '../../stores/canvasStore';
import { useAutosave } from '../../hooks/useAutosave';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export function AppShell() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const activePlanId = useProjectStore((s) => s.activePlanId);
  const plans = useProjectStore((s) => s.project.plans);
  const loadFromStorage = useProjectStore((s) => s.loadFromStorage);
  const renderMode = useCanvasStore((s) => s.renderMode);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useAutosave();
  useKeyboardShortcuts();

  const activePlan = (activePlanId ? plans.find((p) => p.id === activePlanId) : null) ?? plans[0] ?? null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header activePlan={activePlan} stageRef={stageRef} />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar activePlan={activePlan} />
        <main className="flex-1 overflow-hidden">
          {activePlan ? (
            renderMode === '3d' ? (
              <ThreeDCanvas plan={activePlan} />
            ) : (
              <LayoutCanvas plan={activePlan} stageRef={stageRef} />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Create a plan to get started
            </div>
          )}
        </main>
        <RightSidebar activePlan={activePlan} />
      </div>
      <BottomBar activePlan={activePlan} />
    </div>
  );
}
