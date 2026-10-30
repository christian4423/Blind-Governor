/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

/**
 * Loads todos from disk. Files written before the `done` -> `completed` rename
 * are migrated on read: a legacy `done` field becomes `completed`, so callers
 * always receive objects matching the current Todo shape.
 */
export function load(path: string): Todo[] {
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt todo file: ${path}`);
  return raw.map(migrate);
}

function migrate(item: unknown): Todo {
  const rec = item as Record<string, unknown>;
  if (rec && typeof rec === "object" && !("completed" in rec) && "done" in rec) {
    const { done, ...rest } = rec;
    return { ...rest, completed: Boolean(done) } as unknown as Todo;
  }
  return item as Todo;
}

export function save(path: string, todos: Todo[]): void {
  writeFileSync(path, JSON.stringify(todos, null, 2) + "\n");
}
