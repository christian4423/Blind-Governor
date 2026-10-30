/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export function formatTodo(todo: Todo): string {
  const box = todo.done ? "[x]" : "[ ]";
  return `${box} ${todo.title}`;
}

function hasDue(todo: Todo): boolean {
  return typeof todo.due === "string" && todo.due.length > 0;
}

export function formatList(todos: Todo[]): string {
  if (todos.length === 0) return "No todos.";
  const dated = todos.filter(hasDue);
  const undated = todos.filter((t) => !hasDue(t));
  return [...dated, ...undated].map(formatTodo).join("\n");
}
