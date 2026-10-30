import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, run } from "../../src/commands";
import { save, load } from "../../src/storage";

const sample = () => [
  { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
  { id: 2, title: "walk dog", done: true },
  { id: 3, title: "pay rent", done: false },
  { id: 4, title: "call mom", done: true },
];

describe("clear", () => {
  it("removes done todos and keeps ids and order", () => {
    const input = sample();
    const out = clear(input);
    expect(out).toEqual([
      { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
      { id: 3, title: "pay rent", done: false },
    ]);
    expect(input).toHaveLength(4);
  });

  it("returns all todos when none are done", () => {
    const input = [{ id: 1, title: "a", done: false }];
    expect(clear(input)).toEqual(input);
  });

  it("run clear saves the filtered list and reports count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, sample());
    const msg = run(path, { kind: "clear" });
    expect(msg).toBe("Cleared 2");
    expect(load(path).map((t) => t.id)).toEqual([1, 3]);
    expect(run(path, { kind: "clear" })).toBe("Cleared 0");
    expect(load(path).map((t) => t.id)).toEqual([1, 3]);
  });
});
