import React, { useRef, useEffect } from 'react';
import Konva from 'konva';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { BottomBar } from './BottomBar';
import { LayoutCanvas } from '../canvas/LayoutCanvas';
import { useProjectStore } from '../../stores/projectStore';
import { useAutosave } from '../../hooks/useAutosave';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export function AppShell() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const getActivePlan = useProjectStore((s) => s.getActivePlan);
  const loadFromStorage = useProjectStore((s) => s.loadFromStorage);
  const activePlanId = useProjectStore((s) => s.activePlanId);
  const project = useProjectStore((s) => s.project);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useAutosave();
  useKeyboardShortcuts();

  const activePlan = getActivePlan();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header activePlan={activePlan} stageRef={stageRef} />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar activePlan={activePlan} />
        <main className="flex-1 overflow-hidden">
          {activePlan ? (
            <LayoutCanvas plan={activePlan} stageRef={stageRef} />
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
