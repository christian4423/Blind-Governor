/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

/** Convert a stored record to a Todo, mapping legacy `done` to `completed`. */
function normalize(record: unknown): Todo {
  if (record === null || typeof record !== "object" || Array.isArray(record)) {
    return record as Todo;
  }
  const { done, ...rest } = record as Record<string, unknown>;
  if ("completed" in rest) return rest as unknown as Todo;
  if (done === undefined) return rest as unknown as Todo;
  return { ...rest, completed: Boolean(done) } as unknown as Todo;
}

export function load(path: string): Todo[] {
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt todo file: ${path}`);
  return raw.map(normalize);
}

export function save(path: string, todos: Todo[]): void {
  writeFileSync(path, JSON.stringify(todos.map(normalize), null, 2) + "\n");
}
