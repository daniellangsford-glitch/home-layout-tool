import Dexie, { type Table } from 'dexie';
import type { Project } from '../types/project';

class LayoutAppDB extends Dexie {
  projects!: Table<Project, string>;

  constructor() {
    super('LayoutAppDB');
    this.version(1).stores({
      projects: 'id, name, updatedAt',
    });
  }
}

export const db = new LayoutAppDB();

export async function saveProject(project: Project): Promise<void> {
  await db.projects.put(project);
}

export async function loadProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function loadLatestProject(): Promise<Project | undefined> {
  return db.projects.orderBy('updatedAt').last();
}
