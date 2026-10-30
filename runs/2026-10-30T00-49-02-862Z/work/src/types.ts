/** @purpose Shared domain types for todos and CLI commands. */

export interface Todo {
  id: number;
  title: string;
  done: boolean;
  due?: string; // ISO date, e.g. "2026-11-01"
}

export type Command =
  | { kind: "add"; title: string; due?: string }
  | { kind: "complete"; id: number }
  | { kind: "list"; verbose?: boolean };

export function nextId(todos: Todo[]): number {
  return todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}
