import { describe, it, expect } from "vitest";
import { clear, parseArgs, run } from "../../src/commands";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sample = () => [
  { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
  { id: 2, title: "walk dog", done: true },
  { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
  { id: 4, title: "call mom", done: true },
];

describe("clear command", () => {
  it("clear() removes done todos, keeps others unchanged and in order", () => {
    const input = sample();
    const out = clear(input);
    expect(out).toEqual([
      { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
      { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
    ]);
    expect(input).toEqual(sample());
  });

  it("clear() on empty list returns empty list", () => {
    expect(clear([])).toEqual([]);
  });

  it("parseArgs recognises clear", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear removes done todos from the file and reports count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    writeFileSync(path, JSON.stringify(sample(), null, 2));
    const msg = run(path, { kind: "clear" } as any);
    expect(msg).toBe("Cleared 2");
    const saved = JSON.parse(readFileSync(path, "utf8"));
    expect(saved).toEqual([
      { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
      { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
    ]);
    expect(run(path, { kind: "clear" } as any)).toBe("Cleared 0");
  });
});
