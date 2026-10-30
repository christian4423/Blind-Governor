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
  it("migrates legacy done to completed on load", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(
      path,
      JSON.stringify([
        { id: 1, title: "a", done: true },
        { id: 2, title: "b", done: false },
      ]),
    );
    const loaded = load(path);
    expect(loaded).toEqual([
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false },
    ]);
    for (const t of loaded) expect("done" in t).toBe(false);
  });
  it("save writes completed and never done", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ id: 1, title: "a", completed: true }]);
    const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>[];
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
  });
});
