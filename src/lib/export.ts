import type { Project } from '../types/project';
import { ProjectSchema } from './validation';

export function exportProjectJSON(project: Project): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProjectJSON(json: string): Project {
  const raw = JSON.parse(json);
  const result = ProjectSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid project file: ${result.error.message}`);
  }
  return result.data as Project;
}

export function exportStagePNG(stageRef: React.RefObject<unknown>, filename: string): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stage = stageRef.current as any;
  if (!stage) return;
  const dataURL = stage.toDataURL({ pixelRatio: 2 });
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  a.click();
}
