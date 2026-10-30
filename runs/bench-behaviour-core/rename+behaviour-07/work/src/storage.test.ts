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
  it("writes keys in order id, title, completed, due and no done key", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [
      { due: "2026-11-01", completed: true, title: "a", id: 1 },
      { completed: false, title: "b", id: 2 },
    ]);
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>[];
    expect(Object.keys(parsed[0])).toEqual(["id", "title", "completed", "due"]);
    expect(Object.keys(parsed[1])).toEqual(["id", "title", "completed"]);
    expect(readFileSync(path, "utf8")).not.toContain('"done"');
  });
  it("migrates legacy done key on load", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "milk", done: true }]));
    const loaded = load(path);
    expect(loaded).toEqual([{ id: 1, title: "milk", completed: true }]);
    expect("done" in loaded[0]).toBe(false);
  });
  it("keeps completed when both completed and done are present", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "x", completed: false, done: true }]));
    expect(load(path)[0].completed).toBe(false);
  });
});
