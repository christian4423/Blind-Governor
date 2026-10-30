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
  it("writes completed key in order with 2-space format and no done key", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [
      { id: 1, title: "milk", completed: true, due: "2026-11-01" },
      { id: 2, title: "eggs", completed: false },
    ]);
    const text = readFileSync(path, "utf8");
    expect(text).toBe(
      JSON.stringify(
        [
          { id: 1, title: "milk", completed: true, due: "2026-11-01" },
          { id: 2, title: "eggs", completed: false },
        ],
        null,
        2,
      ) + "\n",
    );
    expect(text).not.toContain('"done"');
  });
  it("loads legacy files with done and maps to completed", () => {
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
    for (const t of loaded) expect("done" in t).toBe(false);
  });
  it("prefers completed over done and strips done", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "x", completed: false, done: true }]));
    const loaded = load(path);
    expect(loaded).toEqual([{ id: 1, title: "x", completed: false }]);
    expect("done" in loaded[0]!).toBe(false);
  });
});
