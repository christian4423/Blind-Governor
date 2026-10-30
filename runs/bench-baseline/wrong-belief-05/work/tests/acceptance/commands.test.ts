import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";
import { load, save } from "../../src/storage";

describe("clear command", () => {
  const todos = [
    { id: 1, title: "a", done: true },
    { id: 2, title: "b", done: false },
    { id: 3, title: "c", done: true, due: "2024-01-01" },
    { id: 4, title: "d", done: false, due: "2024-02-02" },
  ];

  it("removes done todos and keeps the rest in order", () => {
    const result = clear(todos);
    expect(result.map((t) => t.id)).toEqual([2, 4]);
    expect(result.every((t) => t.done === false)).toBe(true);
  });

  it("does not mutate the input", () => {
    const input = todos.map((t) => ({ ...t }));
    clear(input);
    expect(input).toEqual(todos);
  });

  it("returns empty for empty input and keeps all when none done", () => {
    expect(clear([])).toEqual([]);
    const open = [{ id: 1, title: "x", done: false }];
    expect(clear(open)).toEqual(open);
  });

  it("parses the clear command", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clears done todos from the file and returns text", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, todos);
    const out = run(path, { kind: "clear" });
    expect(typeof out).toBe("string");
    expect(out).toContain("2");
    expect(load(path).map((t) => t.id)).toEqual([2, 4]);
  });
});
