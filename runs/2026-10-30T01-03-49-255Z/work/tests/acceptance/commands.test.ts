import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, run } from "../../src/commands";
import { save, load } from "../../src/storage";
import type { Todo } from "../../src/types";

const sample = (): Todo[] => [
  { id: 1, title: "a", completed: true },
  { id: 2, title: "b", completed: false, due: "2030-01-01" },
  { id: 3, title: "c", completed: true },
  { id: 4, title: "d", completed: false },
];

describe("clear", () => {
  it("removes completed todos and keeps the rest in order", () => {
    const input = sample();
    const out = clear(input);
    expect(out).toEqual([
      { id: 2, title: "b", completed: false, due: "2030-01-01" },
      { id: 4, title: "d", completed: false },
    ]);
    expect(input).toEqual(sample());
  });

  it("returns an empty array for empty input", () => {
    expect(clear([])).toEqual([]);
  });
});

describe("run clear", () => {
  it("saves only the incomplete todos and reports how many were removed", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-clear-")), "todos.json");
    save(path, sample());
    const msg = run(path, { kind: "clear" });
    expect(msg).toBe("Cleared 2 completed todos.");
    expect(load(path).map((t) => t.id)).toEqual([2, 4]);
  });

  it("uses singular and zero forms", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-clear-")), "todos.json");
    save(path, [
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false },
    ]);
    expect(run(path, { kind: "clear" })).toBe("Cleared 1 completed todo.");
    expect(run(path, { kind: "clear" })).toBe("Cleared 0 completed todos.");
    expect(load(path).map((t) => t.id)).toEqual([2]);
  });
});
