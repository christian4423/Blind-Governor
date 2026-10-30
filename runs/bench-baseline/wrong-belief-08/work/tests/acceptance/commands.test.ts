import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, run } from "../../src/commands";
import { load, save } from "../../src/storage";
import type { Todo } from "../../src/types";

const sample = (): Todo[] => [
  { id: 1, title: "a", done: true },
  { id: 2, title: "b", done: false },
  { id: 3, title: "c", done: true, due: "2024-01-01" },
  { id: 4, title: "d", done: false, due: "2024-02-02" },
];

describe("clear", () => {
  it("removes only done todos, preserving order and ids", () => {
    expect(clear(sample())).toEqual([
      { id: 2, title: "b", done: false },
      { id: 4, title: "d", done: false, due: "2024-02-02" },
    ]);
  });

  it("does not mutate the input", () => {
    const input = sample();
    clear(input);
    expect(input).toEqual(sample());
  });

  it("handles empty and all-pending lists", () => {
    expect(clear([])).toEqual([]);
    const pending: Todo[] = [{ id: 1, title: "x", done: false }];
    expect(clear(pending)).toEqual(pending);
  });

  it("run with clear persists the result and returns text", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, sample());
    const out = run(path, { kind: "clear" });
    expect(typeof out).toBe("string");
    expect(load(path).map((t) => t.id)).toEqual([2, 4]);
  });
});
