import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";

const sample = () => [
  { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
  { id: 2, title: "walk dog", done: true },
  { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
  { id: 4, title: "call mom", done: true },
];

describe("clear command", () => {
  it("clear removes done todos, keeps others and their ids", () => {
    const input = sample();
    const out = clear(input);
    expect(out).toEqual([
      { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
      { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
    ]);
    expect(input).toHaveLength(4);
  });

  it("clear with nothing done returns all todos", () => {
    const input = [{ id: 1, title: "a", done: false }];
    expect(clear(input)).toEqual(input);
    expect(clear([])).toEqual([]);
  });

  it("parseArgs recognises clear", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear persists and reports count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    writeFileSync(path, JSON.stringify(sample()));
    expect(run(path, { kind: "clear" })).toBe("Cleared 2");
    const saved = JSON.parse(readFileSync(path, "utf8"));
    expect(saved.map((t: { id: number }) => t.id)).toEqual([1, 3]);
    expect(run(path, { kind: "clear" })).toBe("Cleared 0");
  });
});
