import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";

const sample = () => [
  { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
  { id: 2, title: "walk dog", done: true },
  { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
];

describe("clear command", () => {
  it("clear removes done todos and keeps ids and order", () => {
    const input = sample();
    const out = clear(input);
    expect(out).toEqual([
      { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
      { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
    ]);
    expect(input).toHaveLength(3);
  });

  it("clear on list with no done todos returns same todos", () => {
    expect(clear([{ id: 1, title: "a", done: false }])).toEqual([{ id: 1, title: "a", done: false }]);
    expect(clear([])).toEqual([]);
  });

  it("parseArgs parses clear", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear saves the filtered list and reports the count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    writeFileSync(path, JSON.stringify(sample(), null, 2));
    expect(run(path, { kind: "clear" })).toBe("Cleared 1");
    const saved = JSON.parse(readFileSync(path, "utf8"));
    expect(saved.map((t: { id: number }) => t.id)).toEqual([1, 3]);
    expect(run(path, { kind: "clear" })).toBe("Cleared 0");
  });
});
