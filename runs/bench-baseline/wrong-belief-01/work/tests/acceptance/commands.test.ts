import { describe, it, expect } from "vitest";
import { clear, run } from "../../src/commands";
import { save, load } from "../../src/storage";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

describe("clear", () => {
  it("removes only done todos, preserving order and ids", () => {
    const todos = [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true, due: "2024-01-01" },
      { id: 4, title: "d", done: false, due: "2024-02-02" },
    ];
    const snapshot = JSON.parse(JSON.stringify(todos));
    const result = clear(todos);
    expect(result).toEqual([
      { id: 2, title: "b", done: false },
      { id: 4, title: "d", done: false, due: "2024-02-02" },
    ]);
    expect(todos).toEqual(snapshot);
  });

  it("returns empty array for empty input", () => {
    expect(clear([])).toEqual([]);
  });

  it("keeps everything when nothing is done", () => {
    const todos = [{ id: 1, title: "a", done: false }];
    expect(clear(todos)).toEqual(todos);
  });

  it("run with clear persists the filtered list and returns a string", () => {
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
