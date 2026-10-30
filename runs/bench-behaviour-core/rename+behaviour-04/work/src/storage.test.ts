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
  it("writes a completed key and no done key", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ id: 1, title: "milk", completed: true }]);
    const text = readFileSync(path, "utf8");
    expect(text).toBe(
      JSON.stringify([{ id: 1, title: "milk", completed: true }], null, 2) + "\n",
    );
    const parsed = JSON.parse(text) as Record<string, unknown>[];
    expect(parsed[0]).not.toHaveProperty("done");
  });
  it("maps legacy done to completed on load", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(
      path,
      JSON.stringify([
        { id: 1, title: "milk", done: true, due: "2026-11-01" },
        { id: 2, title: "eggs", done: false },
      ]),
    );
    const loaded = load(path);
    expect(loaded).toEqual([
      { id: 1, title: "milk", completed: true, due: "2026-11-01" },
      { id: 2, title: "eggs", completed: false },
    ]);
    for (const t of loaded) expect(t).not.toHaveProperty("done");
  });
  it("prefers completed over legacy done when both exist", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "milk", done: true, completed: false }]));
    const loaded = load(path);
    expect(loaded[0]?.completed).toBe(false);
  });
});
