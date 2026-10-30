/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

/** Ensure a todo record uses the `completed` key, migrating legacy `done`. */
function normalize(item: unknown): Todo {
  const { done, ...rest } = item as Record<string, unknown>;
  const completed =
    typeof rest.completed === "boolean" ? rest.completed : Boolean(done);
  return { ...rest, completed } as unknown as Todo;
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
