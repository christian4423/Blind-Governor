/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export function formatTodo(todo: Todo): string {
  const box = todo.done ? "[x]" : "[ ]";
  return `${box} ${todo.title}`;
}

function isDated(todo: Todo): boolean {
  return todo.due !== undefined && todo.due !== "";
}

export function formatList(todos: Todo[]): string {
  if (todos.length === 0) return "No todos.";
  const dated = todos.filter(isDated);
  const undated = todos.filter((todo) => !isDated(todo));
  return dated.concat(undated).map(formatTodo).join("\n");
}
