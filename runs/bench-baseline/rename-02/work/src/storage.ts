/** @purpose Load and save the todo list as a JSON file on disk. */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Todo } from "./types";

type RawRecord = Record<string, unknown>;

function normalize(rec: unknown): Todo {
  if (rec === null || typeof rec !== "object" || Array.isArray(rec)) return rec as Todo;
  const { done, ...rest } = rec as RawRecord;
  const out: RawRecord = { ...rest };
  if (!("completed" in out) && done !== undefined) out.completed = done;
  return out as unknown as Todo;
}

export function load(path: string): Todo[] {
  if (!existsSync(path)) return [];
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!Array.isArray(raw)) throw new Error(`Corrupt todo file: ${path}`);
  return raw.map(normalize);
}

export function save(path: string, todos: Todo[]): void {
  writeFileSync(path, JSON.stringify(todos.map(normalize), null, 2) + "\n");
}
