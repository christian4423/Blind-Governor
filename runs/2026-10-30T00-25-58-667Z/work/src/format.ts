/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export function formatTodo(todo: Todo, verbose?: boolean): string {
  const box = todo.done ? "[x]" : "[ ]";
  if (verbose) {
    return `${box} ${todo.title} (id: ${todo.id}${todo.due ? `, due: ${todo.due}` : ""})`;
  }
  return `${box} ${todo.title}`;
}

export function formatList(todos: Todo[], verbose?: boolean): string {
  if (todos.length === 0) return "No todos.";
  return todos.map(todo => formatTodo(todo, verbose)).join("\n");
}
