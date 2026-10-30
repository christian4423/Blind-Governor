import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { load, save } from "../../src/storage";

function tmp(): string {
  return join(mkdtempSync(join(tmpdir(), "todo-acc-")), "todos.json");
}

describe("storage completed field", () => {
  it("saves with completed key and no done key", () => {
    const p = tmp();
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
  });
  it("round-trips completed", () => {
    const p = tmp();
    save(p, [{ id: 1, title: "a", completed: false, due: "2026-11-01" }]);
    expect(load(p)).toEqual([{ id: 1, title: "a", completed: false, due: "2026-11-01" }]);
  });
  it("loads legacy files using done", () => {
    const p = tmp();
    writeFileSync(p, JSON.stringify([{ id: 2, title: "walk dog", done: true }]));
    const todos = load(p);
    expect(todos).toEqual([{ id: 2, title: "walk dog", completed: true }]);
    expect("done" in todos[0]).toBe(false);
  });
});
