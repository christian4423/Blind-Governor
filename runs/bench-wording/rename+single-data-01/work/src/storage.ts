/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

/** Upgrade a stored item from the legacy `done` field to `completed`. */
function migrate(item: unknown): Todo {
  if (typeof item !== "object" || item === null) return item as Todo;
  const { done, ...rest } = item as Record<string, unknown>;
  if (rest.completed === undefined && done !== undefined) rest.completed = Boolean(done);
  return rest as unknown as Todo;
}

export function load(path: string): Todo[] {
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt todo file: ${path}`);
  return raw.map(migrate);
}

export function save(path: string, todos: Todo[]): void {
  writeFileSync(path, JSON.stringify(todos, null, 2) + "\n");
}
