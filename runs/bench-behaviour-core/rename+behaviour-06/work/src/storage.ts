/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

type RawEntry = Record<string, unknown>;

function normalize(entry: RawEntry): Todo {
  const { id, title, done, completed, due, ...rest } = entry;
  const todo: Record<string, unknown> = {
    id,
    title,
    completed: completed !== undefined ? completed : done,
  };
  if (due !== undefined) todo.due = due;
  return { ...todo, ...rest } as unknown as Todo;
}

export function load(path: string): Todo[] {
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt todo file: ${path}`);
  return raw.map((entry) =>
    entry !== null && typeof entry === "object" ? normalize(entry as RawEntry) : (entry as Todo),
  );
}

export function save(path: string, todos: Todo[]): void {
  const ordered = todos.map((t) => normalize(t as unknown as RawEntry));
  writeFileSync(path, JSON.stringify(ordered, null, 2) + "\n");
}
