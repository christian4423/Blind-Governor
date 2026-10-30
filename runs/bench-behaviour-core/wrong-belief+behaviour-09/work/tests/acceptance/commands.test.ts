import { describe, it, expect } from "vitest";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { clear, run } from "../../src/commands";
import { load, save } from "../../src/storage";

const sample = () => [
  { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
  { id: 2, title: "walk dog", done: true },
  { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
];

describe("clear", () => {
  it("removes done todos and keeps others unchanged", () => {
    const input = sample();
    const out = clear(input);
    expect(out).toEqual([
      { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
      { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
    ]);
    expect(input).toEqual(sample());
  });

  it("returns all todos when none are done", () => {
    const t = [{ id: 1, title: "a", done: false }];
    expect(clear(t)).toEqual(t);
  });

  it("returns empty for empty list", () => {
    expect(clear([])).toEqual([]);
  });

  it("run clear removes done todos from the file and reports the count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, sample());
    expect(run(path, { kind: "clear" })).toBe("Cleared 1");
    expect(load(path)).toEqual([
      { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
      { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
    ]);
    expect(run(path, { kind: "clear" })).toBe("Cleared 0");
    expect(load(path).length).toBe(2);
  });
});
