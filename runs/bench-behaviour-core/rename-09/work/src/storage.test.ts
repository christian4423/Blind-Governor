import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { load, save } from "./storage";
import type { Todo } from "./types";

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
  it("writes completed and not done", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ id: 1, title: "milk", completed: true }]);
    const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>[];
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
  });
  it("strips a stray done property on save", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    const todo = { id: 1, title: "milk", completed: false, done: true } as unknown as Todo;
    save(path, [todo]);
    const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>[];
    expect(raw[0]).toEqual({ id: 1, title: "milk", completed: false });
  });
  it("migrates legacy done to completed on load", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(
      path,
      JSON.stringify([
        { id: 1, title: "milk", done: true },
        { id: 2, title: "eggs", done: false, due: "2026-11-01" },
      ]),
    );
    const loaded = load(path);
    expect(loaded).toEqual([
      { id: 1, title: "milk", completed: true },
      { id: 2, title: "eggs", completed: false, due: "2026-11-01" },
    ]);
    expect("done" in loaded[0]).toBe(false);
  });
  it("prefers completed over legacy done when both present", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "milk", completed: false, done: true }]));
    expect(load(path)).toEqual([{ id: 1, title: "milk", completed: false }]);
  });
});
