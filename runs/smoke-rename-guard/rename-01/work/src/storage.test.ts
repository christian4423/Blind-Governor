import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { load, save } from "./storage";

describe("storage", () => {
  it("returns [] for a missing file", () => {
    expect(load(join(mkdtempSync(join(tmpdir(), "todo-")), "none.json"))).toEqual([]);
  });
  it("round-trips todos", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    const todos = [{ id: 1, title: "milk", completed: false, due: "2026-11-01" }];
    save(path, todos);
    expect(load(path)).toEqual(todos);
  });
  it("reads legacy files with a done key", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(
      path,
      JSON.stringify([
        { id: 1, title: "a", done: true },
        { id: 2, title: "b", done: false, due: "2026-01-01" },
      ]),
    );
    const loaded = load(path);
    expect(loaded).toEqual([
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false, due: "2026-01-01" },
    ]);
    for (const t of loaded) expect("done" in t).toBe(false);
  });
  it("prefers completed and drops done when both present", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "a", completed: false, done: true }]));
    const loaded = load(path);
    expect(loaded).toEqual([{ id: 1, title: "a", completed: false }]);
    expect("done" in loaded[0]).toBe(false);
  });
  it("save writes completed and never done", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ id: 1, title: "a", completed: true }]);
    const text = readFileSync(path, "utf8");
    expect(text).toContain('"completed": true');
    expect(text).not.toContain('"done"');
  });
});
