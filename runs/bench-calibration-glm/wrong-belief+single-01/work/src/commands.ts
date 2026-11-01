/** @purpose Execute CLI commands against the todo store and return output text. */
import { load, save } from "./storage";
import { formatList } from "./format";
import { nextId, type Command, type Todo } from "./types";

export interface ListOptions {
  includeDone?: boolean;
}

export function add(todos: Todo[], title: string, due?: string): Todo[] {
  const todo: Todo = { id: nextId(todos), title, done: false };
  if (due) todo.due = due;
  return [...todos, todo];
}

export function complete(todos: Todo[], id: number): Todo[] {
  if (!todos.some((t) => t.id === id)) throw new Error(`No todo with id ${id}`);
  return todos.map((t) => (t.id === id ? { ...t, done: true } : t));
}

export function clear(todos: Todo[]): Todo[] {
  return todos.filter((t) => !t.done);
}

export function list(todos: Todo[], opts: ListOptions = {}): string {
  const visible = opts.includeDone === false ? todos.filter((t) => !t.done) : todos;
  return formatList(visible);
}

export function parseArgs(argv: string[]): Command {
  const [kind, ...rest] = argv;
  if (kind === "add") return { kind: "add", title: rest[0], due: rest[1] };
  if (kind === "complete") return { kind: "complete", id: Number(rest[0]) };
  if (kind === "clear") return { kind: "clear" };
  return { kind: "list" };
}

export function run(path: string, cmd: Command): string {
  const todos = load(path);
  switch (cmd.kind) {
    case "add": {
      const next = add(todos, cmd.title, cmd.due);
      save(path, next);
      return `Added #${next[next.length - 1].id}`;
    }
    case "complete":
      save(path, complete(todos, cmd.id));
      return `Completed #${cmd.id}`;
    case "clear": {
      const next = clear(todos);
      save(path, next);
      return `Cleared ${todos.length - next.length}`;
    }
    case "list":
      return list(todos);
  }
}
