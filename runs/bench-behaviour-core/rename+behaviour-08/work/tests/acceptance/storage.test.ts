import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage uses completed", () => {
  it("round-trips completed and writes completed key", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-acc-")), "todos.json");
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
    expect(load(p)).toEqual([{ id: 1, title: "a", completed: true }]);
  });
  it("maps legacy done to completed", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-acc-")), "todos.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }]));
    const loaded = load(p);
    expect(loaded[0].completed).toBe(true);
    expect("done" in loaded[0]).toBe(false);
  });
});
