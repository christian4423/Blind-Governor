import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";
import { save, load } from "../../src/storage";

describe("clear command", () => {
  it("removes only done todos and keeps order", () => {
    const todos = [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true, due: "2024-01-01" },
      { id: 4, title: "d", done: false, due: "2024-02-02" },
    ];
    const copy = JSON.parse(JSON.stringify(todos));
    const result = clear(todos);
    expect(result).toEqual([
      { id: 2, title: "b", done: false },
      { id: 4, title: "d", done: false, due: "2024-02-02" },
    ]);
    expect(todos).toEqual(copy);
  });

  it("returns empty for empty input", () => {
    expect(clear([])).toEqual([]);
  });

  it("parses clear", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear persists the filtered list and reports count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true },
    ]);
    const out = run(path, { kind: "clear" });
    expect(out).toBe("Cleared 2 todo(s).");
    expect(load(path)).toEqual([{ id: 2, title: "b", done: false }]);
  });
});
