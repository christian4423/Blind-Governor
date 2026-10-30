import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage with completed", () => {
  it("saves completed key and round-trips", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(p, [{ id: 1, title: "a", completed: true }, { id: 2, title: "b", completed: false, due: "2026-11-01" }]);
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect(raw[0]).not.toHaveProperty("done");
    expect(load(p)).toEqual([{ id: 1, title: "a", completed: true }, { id: 2, title: "b", completed: false, due: "2026-11-01" }]);
  });
  it("migrates legacy done on load", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }]));
    expect(load(p)).toEqual([{ id: 1, title: "a", completed: true }]);
  });
});
