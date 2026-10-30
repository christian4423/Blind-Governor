/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

type StoredTodo = Omit<Todo, "completed"> & { completed?: boolean; done?: boolean };

/** Accepts both the current `completed` field and the legacy `done` field. */
function normalize(item: StoredTodo): Todo {
  const { done, completed, ...rest } = item;
  return { ...rest, completed: completed ?? done ?? false };
}

export function load(path: string): Todo[] {
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt todo file: ${path}`);
  return (raw as StoredTodo[]).map(normalize);
}

export function save(path: string, todos: Todo[]): void {
  writeFileSync(path, JSON.stringify(todos, null, 2) + "\n");
}
