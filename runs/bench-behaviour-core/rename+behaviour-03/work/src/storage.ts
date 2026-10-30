/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

/** Normalize a stored record: legacy files used `done`; current schema uses `completed`. */
function normalize(item: unknown): Todo {
  const { done, completed, ...rest } = item as Record<string, unknown>;
  return {
    ...(rest as Omit<Todo, "completed">),
    completed: Boolean(completed ?? done ?? false),
  };
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
