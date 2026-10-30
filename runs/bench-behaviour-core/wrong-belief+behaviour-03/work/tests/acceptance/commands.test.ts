import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";

describe("clear command", () => {
  it("clear() removes done todos and keeps others unchanged", () => {
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

  it("clear() on empty or all-pending list returns same contents", () => {
    expect(clear([])).toEqual([]);
    expect(clear([{ id: 1, title: "a", done: false }])).toEqual([{ id: 1, title: "a", done: false }]);
  });

  it("parseArgs recognises clear", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear removes done todos from the file and reports count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    run(path, { kind: "add", title: "buy milk", due: "2026-11-01" });
    run(path, { kind: "add", title: "walk dog" });
    run(path, { kind: "add", title: "pay rent" });
    run(path, { kind: "complete", id: 2 });
    expect(run(path, { kind: "clear" } as any)).toBe("Cleared 1");
    const saved = JSON.parse(readFileSync(path, "utf8"));
    expect(saved.map((t: any) => t.id)).toEqual([1, 3]);
    expect(saved.every((t: any) => t.done === false)).toBe(true);
    expect(run(path, { kind: "clear" } as any)).toBe("Cleared 0");
    const again = JSON.parse(readFileSync(path, "utf8"));
    expect(again.map((t: any) => t.id)).toEqual([1, 3]);
  });
});
