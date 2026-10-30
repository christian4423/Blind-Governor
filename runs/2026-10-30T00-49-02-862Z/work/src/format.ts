/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export function formatTodo(todo: Todo): string {
  const box = todo.done ? "[x]" : "[ ]";
  return `${box} ${todo.title}`;
}

export function formatList(todos: Todo[]): string {
  if (todos.length === 0) return "No todos.";
  return todos.map(formatTodo).join("\n");
}

export function formatTodoVerbose(todo: Todo): string {
  const box = todo.done ? "[x]" : "[ ]";
  const due = todo.due ? ` (due ${todo.due})` : "";
  return `#${todo.id} ${box} ${todo.title}${due}`;
}

export function formatListVerbose(todos: Todo[]): string {
  const done = todos.filter((t) => t.done).length;
  const open = todos.length - done;
  const lines = todos.map(formatTodoVerbose);
  lines.push(`${open} open, ${done} done`);
  return lines.join("\n");
}
