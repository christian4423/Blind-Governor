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
  it("saves with key order id, title, completed, due", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ due: "2026-11-01", completed: true, title: "milk", id: 1 }]);
    const parsed = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>[];
    expect(Object.keys(parsed[0])).toEqual(["id", "title", "completed", "due"]);
    expect(readFileSync(path, "utf8")).not.toContain('"done"');
  });
  it("maps legacy done to completed and drops done", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "milk", done: true }]));
    const loaded = load(path);
    expect(loaded).toEqual([{ id: 1, title: "milk", completed: true }]);
    expect("done" in loaded[0]).toBe(false);
  });
  it("prefers completed over legacy done when both present", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "milk", done: true, completed: false }]));
    const loaded = load(path);
    expect(loaded[0].completed).toBe(false);
    expect("done" in loaded[0]).toBe(false);
  });
});
