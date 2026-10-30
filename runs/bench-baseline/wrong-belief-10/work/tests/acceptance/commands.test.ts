import { describe, it, expect } from "vitest";
import { clear, run } from "../../src/commands";
import { load, save } from "../../src/storage";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("clear command", () => {
  it("removes only done todos, preserving order and fields", () => {
    const todos = [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false, due: "2024-01-01" },
      { id: 3, title: "c", done: true },
      { id: 4, title: "d", done: false },
    ];
    const result = clear(todos);
    expect(result).toEqual([
      { id: 2, title: "b", done: false, due: "2024-01-01" },
      { id: 4, title: "d", done: false },
    ]);
    expect(todos).toHaveLength(4);
  });

  it("returns empty array for empty input and keeps all when none done", () => {
    expect(clear([])).toEqual([]);
    const t = [{ id: 1, title: "x", done: false }];
    expect(clear(t)).toEqual(t);
  });

  it("run with kind clear persists the filtered list and returns a string", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
    ]);
    const out = run(path, { kind: "clear" });
    expect(typeof out).toBe("string");
    expect(load(path)).toEqual([{ id: 2, title: "b", done: false }]);
  });
});
