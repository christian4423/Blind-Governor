import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { load, save } from "../../src/storage";

function tmp(): string {
  return join(mkdtempSync(join(tmpdir(), "todo-acc-")), "todos.json");
}

describe("storage with completed", () => {
  it("saves completed key and not done", () => {
    const p = tmp();
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
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
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }, { id: 2, title: "b", done: false }]));
    expect(load(p)).toEqual([
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false },
    ]);
  });
});
