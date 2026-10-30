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
  it("writes the completed key in order id, title, completed, due", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ id: 1, title: "milk", completed: true, due: "2026-11-01" }]);
    expect(readFileSync(path, "utf8")).toBe(
      '[\n  {\n    "id": 1,\n    "title": "milk",\n    "completed": true,\n    "due": "2026-11-01"\n  }\n]\n',
    );
  });
  it("loads legacy files using done", () => {
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
