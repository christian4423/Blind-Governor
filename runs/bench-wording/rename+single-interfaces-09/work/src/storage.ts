/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

export function load(path: string): Todo[] {
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt todo file: ${path}`);
  return raw.map(migrateLegacy);
}

export function save(path: string, todos: Todo[]): void {
  writeFileSync(path, JSON.stringify(todos, null, 2) + "\n");
}

/** Files written before the rename store `done` instead of `completed`; convert them so callers always get a Todo. */
function migrateLegacy(item: unknown): Todo {
  if (item && typeof item === "object" && "done" in item && !("completed" in item)) {
    const { done, ...rest } = item as Record<string, unknown>;
    return { ...rest, completed: Boolean(done) } as unknown as Todo;
  }
  return item as Todo;
}
