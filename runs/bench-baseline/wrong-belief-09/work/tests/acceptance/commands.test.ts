import { describe, it, expect } from "vitest";
import { clear, parseArgs, run } from "../../src/commands";
import { save, load } from "../../src/storage";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sample = () => [
  { id: 1, title: "a", done: true },
  { id: 2, title: "b", done: false },
  { id: 3, title: "c", done: true, due: "2024-01-01" },
  { id: 4, title: "d", done: false, due: "2024-02-02" },
];

describe("clear", () => {
  it("removes done todos and keeps the others in order with ids unchanged", () => {
    expect(clear(sample())).toEqual([
      { id: 2, title: "b", done: false },
      { id: 4, title: "d", done: false, due: "2024-02-02" },
    ]);
  });

  it("does not mutate its input", () => {
    const input = sample();
    const copy = JSON.parse(JSON.stringify(input));
    clear(input);
    expect(input).toEqual(copy);
  });

  it("handles an empty list and a list with nothing done", () => {
    expect(clear([])).toEqual([]);
    const open = [{ id: 1, title: "x", done: false }];
    expect(clear(open)).toEqual(open);
  });

  it("parses the clear command", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run persists the cleared list and reports the count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, sample());
    const out = run(path, { kind: "clear" });
    expect(out).toBe("Cleared 2 completed todos.");
    expect(load(path).map((t) => t.id)).toEqual([2, 4]);
  });

  it("run uses singular wording for one removed todo", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
    ]);
    expect(run(path, { kind: "clear" })).toBe("Cleared 1 completed todo.");
    expect(load(path).map((t) => t.id)).toEqual([2]);
  });
});
