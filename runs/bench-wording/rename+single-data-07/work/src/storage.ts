/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

/** Upgrade a stored record; files written before the rename use `done` instead of `completed`. */
function migrate(entry: unknown): Todo {
  const rec = entry as Record<string, unknown>;
  if (rec && typeof rec === "object" && !("completed" in rec) && "done" in rec) {
    const { done, ...rest } = rec;
    return { ...rest, completed: Boolean(done) } as unknown as Todo;
  }
  return rec as unknown as Todo;
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
