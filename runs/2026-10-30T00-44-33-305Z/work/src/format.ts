/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export interface FormatOptions {
  verbose?: boolean;
}

export function formatTodo(todo: Todo, opts?: FormatOptions): string {
  const box = todo.done ? "[x]" : "[ ]";
  const base = `${box} ${todo.title}`;
  if (!opts?.verbose) return base;
  return `${base} [id: ${todo.id}] [due: ${todo.due ?? "none"}]`;
}

export function formatList(todos: Todo[], opts?: FormatOptions): string {
  if (todos.length === 0) return "No todos.";
  return todos.map((t) => formatTodo(t, opts)).join("\n");
}
