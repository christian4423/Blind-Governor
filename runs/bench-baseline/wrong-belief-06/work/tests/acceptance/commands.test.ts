import { describe, it, expect } from "vitest";
import { clear, run } from "../../src/commands";
import { load, save } from "../../src/storage";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

describe("clear", () => {
  it("removes done todos and keeps others unchanged", () => {
    const todos = [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false, due: "2024-01-01" },
      { id: 3, title: "c", done: true },
      { id: 4, title: "d", done: false },
    ];
    const copy = JSON.parse(JSON.stringify(todos));
    const result = clear(todos);
    expect(result).toEqual([
      { id: 2, title: "b", done: false, due: "2024-01-01" },
      { id: 4, title: "d", done: false },
    ]);
    expect(todos).toEqual(copy);
  });

  it("returns empty array for empty input", () => {
    expect(clear([])).toEqual([]);
  });

  it("run clear persists the filtered list and reports the count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true },
    ]);
    const out = run(path, { kind: "clear" });
    expect(out).toBe("Cleared 2 todo(s)");
    expect(load(path)).toEqual([{ id: 2, title: "b", done: false }]);
  });
});
