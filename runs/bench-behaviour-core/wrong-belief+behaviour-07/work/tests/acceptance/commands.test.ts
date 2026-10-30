import { describe, it, expect } from "vitest";
import { clear, parseArgs, run } from "../../src/commands";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

describe("clear command", () => {
  it("clear removes done todos and keeps others in order with ids", () => {
    const todos = [
      { id: 1, title: "a", done: false, due: "2026-11-01" },
      { id: 2, title: "b", done: true },
      { id: 3, title: "c", done: false },
    ];
    const copy = JSON.parse(JSON.stringify(todos));
    const out = clear(todos);
    expect(out).toEqual([
      { id: 1, title: "a", done: false, due: "2026-11-01" },
      { id: 3, title: "c", done: false },
    ]);
    expect(todos).toEqual(copy);
  });

  it("clear on empty list returns empty list", () => {
    expect(clear([])).toEqual([]);
  });

  it("parseArgs recognises clear", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear persists and reports count", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "todo-clear-"));
    const file = path.join(dir, "todos.json");
    fs.writeFileSync(
      file,
      JSON.stringify([
        { id: 1, title: "a", done: true },
        { id: 2, title: "b", done: false },
        { id: 3, title: "c", done: true },
      ])
    );
    expect(run(file, { kind: "clear" })).toBe("Cleared 2 todos");
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    expect(saved).toEqual([{ id: 2, title: "b", done: false }]);
    expect(run(file, { kind: "clear" })).toBe("Cleared 0 todos");
  });

  it("run clear uses singular for one", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "todo-clear-"));
    const file = path.join(dir, "todos.json");
    fs.writeFileSync(file, JSON.stringify([{ id: 5, title: "x", done: true }]));
    expect(run(file, { kind: "clear" })).toBe("Cleared 1 todo");
    expect(JSON.parse(fs.readFileSync(file, "utf8"))).toEqual([]);
  });
});
