/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

/** Files written before the rename store `done`; map it to `completed`. */
function normalize(item: unknown): Todo {
  const rec = item as Record<string, unknown>;
  if (rec && typeof rec === "object" && rec.completed === undefined && typeof rec.done === "boolean") {
    const { done, ...rest } = rec;
    return { ...rest, completed: done } as unknown as Todo;
  }
  return item as Todo;
}

export function load(path: string): Todo[] {
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt todo file: ${path}`);
  return raw.map(normalize);
}

export function save(path: string, todos: Todo[]): void {
  writeFileSync(path, JSON.stringify(todos, null, 2) + "\n");
}
