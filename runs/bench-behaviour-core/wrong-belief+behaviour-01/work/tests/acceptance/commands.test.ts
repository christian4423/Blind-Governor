import { describe, it, expect } from "vitest";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { clear, parseArgs, run, list } from "../../src/commands";

describe("clear command", () => {
  it("clear removes done todos and keeps ids/order of the rest", () => {
    const todos = [
      { id: 1, title: "a", done: false, due: "2026-11-01" },
      { id: 2, title: "b", done: true },
      { id: 3, title: "c", done: false },
    ];
    const copy = JSON.parse(JSON.stringify(todos));
    const result = clear(todos);
    expect(result).toEqual([
      { id: 1, title: "a", done: false, due: "2026-11-01" },
      { id: 3, title: "c", done: false },
    ]);
    expect(todos).toEqual(copy);
  });

  it("clear on list with nothing done returns all", () => {
    const todos = [{ id: 1, title: "a", done: false }];
    expect(clear(todos)).toEqual(todos);
    expect(clear([])).toEqual([]);
  });

  it("parseArgs parses clear", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear removes done todos from file and reports count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    run(path, { kind: "add", title: "buy milk" });
    run(path, { kind: "add", title: "walk dog" });
    run(path, { kind: "add", title: "pay rent" });
    run(path, { kind: "complete", id: 2 });
    expect(run(path, { kind: "clear" } as any)).toBe("Cleared 1");
    const out = run(path, { kind: "list" });
    expect(out).toContain("buy milk");
    expect(out).toContain("pay rent");
    expect(out).not.toContain("walk dog");
    expect(run(path, { kind: "clear" } as any)).toBe("Cleared 0");
  });
});
