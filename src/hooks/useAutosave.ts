import { useEffect, useRef } from 'react';
import { useProjectStore } from '../stores/projectStore';

export function useAutosave(delayMs = 1500) {
  const project = useProjectStore((s) => s.project);
  const saveState = useProjectStore((s) => s.saveState);
  const saveToStorage = useProjectStore((s) => s.saveToStorage);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveState !== 'unsaved') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveToStorage();
    }, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [project, saveState, saveToStorage, delayMs]);
}
