/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export function formatTodo(todo: Todo): string {
  const box = todo.done ? "[x]" : "[ ]";
  return `${box} ${todo.title}`;
}

export function formatList(todos: Todo[], verbose?: boolean): string {
  if (todos.length === 0) return "No todos.";
  return todos.map(todo => {
    const box = todo.done ? "[x]" : "[ ]";
    let result = `${box} ${todo.title}`;
    if (verbose) {
      result += ` (id: ${todo.id}, done: ${todo.done})`;
    }
    return result;
  }).join("\n");
}
