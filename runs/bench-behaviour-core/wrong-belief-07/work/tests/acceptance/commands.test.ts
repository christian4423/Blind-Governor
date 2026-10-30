import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";
import { load, save } from "../../src/storage";

describe("clear command", () => {
  it("removes todos with done true, keeping order and ids", () => {
    const todos = [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true },
      { id: 4, title: "d", done: false, due: "2030-01-01" },
    ];
    const copy = JSON.parse(JSON.stringify(todos));
    const result = clear(todos);
    expect(result).toEqual([
      { id: 2, title: "b", done: false },
      { id: 4, title: "d", done: false, due: "2030-01-01" },
    ]);
    expect(todos).toEqual(copy);
  });

  it("returns an empty list when given one", () => {
    expect(clear([])).toEqual([]);
  });

  it("parses the clear command", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear saves only incomplete todos and reports the count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true },
    ]);
    const out = run(path, { kind: "clear" });
    expect(out).toBe("Cleared 2 completed todo(s).");
    expect(load(path)).toEqual([{ id: 2, title: "b", done: false }]);
    expect(run(path, { kind: "clear" })).toBe("Cleared 0 completed todo(s).");
  });
});
