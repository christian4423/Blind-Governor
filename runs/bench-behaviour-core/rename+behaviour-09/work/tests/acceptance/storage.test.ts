import { describe, it, expect } from "vitest";
import { load, save } from "../../src/storage";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function tmp(): string {
  return join(mkdtempSync(join(tmpdir(), "todo-acc-")), "todos.json");
}

describe("storage uses completed", () => {
  it("save writes the completed key and not done", () => {
    const p = tmp();
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(raw[0], "done")).toBe(false);
  });
  it("round-trips", () => {
    const p = tmp();
    const todos = [
      { id: 1, title: "a", completed: false, due: "2026-11-01" },
      { id: 2, title: "b", completed: true },
    ];
    save(p, todos);
    expect(load(p)).toEqual(todos);
  });
  it("loads legacy done key as completed", () => {
    const p = tmp();
    writeFileSync(p, JSON.stringify([{ id: 1, title: "x", done: true }, { id: 2, title: "y", done: false }]));
    const loaded = load(p);
    expect(loaded).toEqual([
      { id: 1, title: "x", completed: true },
      { id: 2, title: "y", completed: false },
    ]);
  });
});
