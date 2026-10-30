/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export function formatTodo(todo: Todo): string {
  const box = todo.done ? "[x]" : "[ ]";
  return `${box} ${todo.title}`;
}

export function formatList(todos: Todo[]): string {
  if (todos.length === 0) return "Nothing to do.";
  return todos.map(formatTodo).join("\n");
}
