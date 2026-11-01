/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export function formatTodo(todo: Todo): string {
  const box = todo.done ? "[x]" : "[ ]";
  return `${box} ${todo.title}`;
}

export function formatList(todos: Todo[]): string {
  if (todos.length === 0) return "No todos.";
  // Stable partition: dated todos (a `due` value is present, not treated as an
  // empty string) first, then undated ones. Input order is preserved within
  // each group.
  const dated = todos.filter((todo) => todo.due !== undefined);
  const undated = todos.filter((todo) => todo.due === undefined);
  return [...dated, ...undated].map(formatTodo).join("\n");
}
