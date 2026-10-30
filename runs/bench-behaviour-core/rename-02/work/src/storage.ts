/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

function normalize(record: unknown): Todo {
  if (record === null || typeof record !== "object") return record as Todo;
  const r = { ...(record as Record<string, unknown>) };
  if ("done" in r) {
    if (!("completed" in r)) r.completed = r.done;
    delete r.done;
  }
  return r as unknown as Todo;
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
