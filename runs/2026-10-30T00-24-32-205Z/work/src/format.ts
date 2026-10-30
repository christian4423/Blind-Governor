/** @purpose Render todos as human-readable terminal text. */
import type { Todo } from "./types";

export function formatTodo(todo: Todo): string {
  const box = todo.done ? "[x]" : "[ ]";
  return `${box} ${todo.title}`;
}

export function formatList(todos: Todo[], verbose?: boolean): string {
  if (todos.length === 0) return "No todos.";
  
  const lines = todos.map((todo, index) => {
    const box = todo.done ? "[x]" : "[ ]";
    let line = `${box} ${todo.title}`;
    if (verbose && todo.due) {
      line += ` (${todo.due})`;
    }
    return line;
  });
  
  return lines.join("\n");
}
