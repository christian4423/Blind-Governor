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
    const todos = [{ id: 1, title: "milk", completed: false, due: "2026-11-01" }] as unknown as Todo[];
    save(path, todos);
    expect(load(path)).toEqual(todos);
  });
  it("writes the completed key and no done key", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ id: 1, title: "milk", completed: true }] as unknown as Todo[]);
    const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>[];
    expect(raw[0]).toHaveProperty("completed", true);
    expect(raw[0]).not.toHaveProperty("done");
  });
  it("migrates legacy done key on load", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 2, title: "eggs", done: true }]));
    const [todo] = load(path);
    expect(todo).toEqual({ id: 2, title: "eggs", completed: true });
    expect(todo).not.toHaveProperty("done");
  });
});
