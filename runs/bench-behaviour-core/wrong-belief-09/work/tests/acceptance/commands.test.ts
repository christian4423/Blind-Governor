import { describe, it, expect } from "vitest";
import { clear, parseArgs, run } from "../../src/commands";
import { load, save } from "../../src/storage";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sample = () => [
  { id: 1, title: "a", done: true },
  { id: 2, title: "b", done: false, due: "2024-01-01" },
  { id: 3, title: "c", done: true },
  { id: 4, title: "d", done: false },
];

describe("clear command", () => {
  it("removes done todos and keeps the rest unchanged and in order", () => {
    const input = sample();
    const out = clear(input);
    expect(out).toEqual([
      { id: 2, title: "b", done: false, due: "2024-01-01" },
      { id: 4, title: "d", done: false },
    ]);
  });

  it("does not mutate the input", () => {
    const input = sample();
    clear(input);
    expect(input).toEqual(sample());
  });

  it("returns an empty array for an empty list and keeps all when none are done", () => {
    expect(clear([])).toEqual([]);
    const open = [{ id: 1, title: "x", done: false }];
    expect(clear(open)).toEqual(open);
  });

  it("parses the clear command", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear persists the filtered list and reports the count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, sample());
    const msg = run(path, { kind: "clear" });
    expect(typeof msg).toBe("string");
    expect(msg).toContain("2");
    expect(load(path)).toEqual([
      { id: 2, title: "b", done: false, due: "2024-01-01" },
      { id: 4, title: "d", done: false },
    ]);
  });
});
