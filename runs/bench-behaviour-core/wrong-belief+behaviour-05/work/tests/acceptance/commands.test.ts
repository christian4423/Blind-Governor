import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";
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

  it("handles empty list", () => {
    expect(clear([])).toEqual([]);
  });

  it("parses the clear command", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear saves remaining todos and reports count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, sample());
    expect(run(path, { kind: "clear" })).toBe("Cleared 1");
    expect(load(path).map((t) => t.id)).toEqual([1, 3]);
    expect(run(path, { kind: "clear" })).toBe("Cleared 0");
    expect(load(path).map((t) => t.id)).toEqual([1, 3]);
  });
});
