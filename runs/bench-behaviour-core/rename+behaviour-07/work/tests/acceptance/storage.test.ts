import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { load, save } from "../../src/storage";

describe("storage completed field", () => {
  it("saves the completed key and not done", () => {
    const p = join(mkdtempSync(join(tmpdir(), "st-")), "todos.json");
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
    expect(load(p)[0].completed).toBe(true);
  });
  it("migrates the legacy done key on load", () => {
    const p = join(mkdtempSync(join(tmpdir(), "st-")), "todos.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }, { id: 2, title: "b", done: false }]));
    const todos = load(p);
    expect(todos[0].completed).toBe(true);
    expect(todos[1].completed).toBe(false);
    expect("done" in todos[0]).toBe(false);
  });
});
