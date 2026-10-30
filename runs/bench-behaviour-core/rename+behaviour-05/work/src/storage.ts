/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

function normalize(rec: unknown, path: string): Todo {
  if (rec === null || typeof rec !== "object" || Array.isArray(rec)) {
    throw new Error(`Corrupt todo file: ${path}`);
  }
  const { done, ...rest } = rec as Record<string, unknown>;
  if (!("completed" in rest) && typeof done === "boolean") {
    rest.completed = done;
  }
  return rest as unknown as Todo;
}

export function load(path: string): Todo[] {
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt todo file: ${path}`);
  return raw.map((rec) => normalize(rec, path));
}

function serialize(todo: Todo): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
  };
  if (todo.due !== undefined) out.due = todo.due;
  return out;
}

export function save(path: string, todos: Todo[]): void {
  writeFileSync(path, JSON.stringify(todos.map(serialize), null, 2) + "\n");
}
