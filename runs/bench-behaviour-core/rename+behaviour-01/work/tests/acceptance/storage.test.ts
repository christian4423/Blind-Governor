import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

function tmp(): string {
  return join(mkdtempSync(join(tmpdir(), "todo-acc-")), "todos.json");
}

describe("storage uses completed", () => {
  it("saves the completed key, not done", () => {
    const p = tmp();
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
  });
  it("round-trips todos", () => {
    const p = tmp();
    const todos = [
      { id: 1, title: "a", completed: false, due: "2026-11-01" },
      { id: 2, title: "b", completed: true },
    ];
    save(p, todos);
    expect(load(p)).toEqual(todos);
  });
  it("maps legacy done key to completed on load", () => {
    const p = tmp();
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }]));
    const loaded = load(p) as any[];
    expect(loaded[0].completed).toBe(true);
    expect("done" in loaded[0]).toBe(false);
  });
});
