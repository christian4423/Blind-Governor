/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

function normalize(item: unknown): Todo {
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    if (typeof obj.done === "boolean" && !("completed" in obj)) {
      const { done, ...rest } = obj;
      return { ...rest, completed: done } as unknown as Todo;
    }
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
  writeFileSync(path, JSON.stringify(todos.map(normalize), null, 2) + "\n");
}
