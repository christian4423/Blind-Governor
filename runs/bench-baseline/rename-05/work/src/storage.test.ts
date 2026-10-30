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
  it("writes completed and no done key", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ id: 1, title: "milk", completed: true }]);
    const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>[];
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
  });
  it("maps legacy done to completed on load", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 2, title: "eggs", done: true }]));
    const loaded = load(path) as unknown as Record<string, unknown>[];
    expect(loaded).toEqual([{ id: 2, title: "eggs", completed: true }]);
    expect("done" in loaded[0]).toBe(false);
  });
  it("prefers completed over legacy done when both present", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 3, title: "x", done: true, completed: false }]));
    expect(load(path)).toEqual([{ id: 3, title: "x", completed: false }]);
  });
});
