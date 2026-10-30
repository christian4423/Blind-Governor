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
  it("writes a completed key with 2-space indent and no done key", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    const todos = [{ id: 1, title: "milk", completed: true }];
    save(path, todos);
    const text = readFileSync(path, "utf8");
    expect(text).toBe(JSON.stringify(todos, null, 2) + "\n");
    expect(text).toContain('"completed": true');
    expect(text).not.toContain('"done"');
  });
  it("migrates legacy done entries to completed on load", () => {
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
    for (const t of loaded) expect("done" in t).toBe(false);
  });
});
