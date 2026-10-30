/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

function migrate(entry: unknown): Todo {
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    const obj = entry as Record<string, unknown>;
    if ("done" in obj && !("completed" in obj)) {
      const { done, ...rest } = obj;
      return { ...rest, completed: Boolean(done) } as unknown as Todo;
    }
  }
  return entry as Todo;
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
