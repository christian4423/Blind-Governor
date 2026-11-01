/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export function formatTodo(todo: Todo): string {
  const box = todo.done ? "[x]" : "[ ]";
  return `${box} ${todo.title}`;
}

export function formatList(todos: Todo[]): string {
  if (todos.length === 0) return "No todos.";
  // Stable partition: todos with a due date come first, but each group keeps
  // the relative order of the input array (no sorting by due-date value).
  const withDue = todos.filter((todo) => todo.due !== undefined);
  const withoutDue = todos.filter((todo) => todo.due === undefined);
  return [...withDue, ...withoutDue].map(formatTodo).join("\n");
}
