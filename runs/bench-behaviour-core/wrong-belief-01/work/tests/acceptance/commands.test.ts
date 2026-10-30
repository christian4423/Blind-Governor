import { describe, it, expect } from "vitest";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { clear, run } from "../../src/commands";
import { save, load } from "../../src/storage";

describe("clear", () => {
  it("removes done todos and keeps the rest in order", () => {
    const todos = [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true },
      { id: 4, title: "d", done: false, due: "2024-01-01" },
    ];
    const copy = JSON.parse(JSON.stringify(todos));
    const result = clear(todos);
    expect(result).toEqual([
      { id: 2, title: "b", done: false },
      { id: 4, title: "d", done: false, due: "2024-01-01" },
    ]);
    expect(todos).toEqual(copy);
  });

  it("returns empty array for empty input", () => {
    expect(clear([])).toEqual([]);
  });

  it("run clear persists the result and reports count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true },
    ]);
    const out = run(path, { kind: "clear" });
    expect(out).toBe("Cleared 2 completed todo(s)");
    expect(load(path)).toEqual([{ id: 2, title: "b", done: false }]);
    const out2 = run(path, { kind: "clear" });
    expect(out2).toBe("Cleared 0 completed todo(s)");
    expect(load(path)).toEqual([{ id: 2, title: "b", done: false }]);
  });
});
