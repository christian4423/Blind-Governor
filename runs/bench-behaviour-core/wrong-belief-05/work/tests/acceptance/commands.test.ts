import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, run } from "../../src/commands";
import { save, load } from "../../src/storage";
import type { Todo } from "../../src/types";

const sample = (): Todo[] => [
  { id: 1, title: "a", done: true },
  { id: 2, title: "b", done: false },
  { id: 3, title: "c", done: true, due: "2024-01-01" },
  { id: 4, title: "d", done: false, due: "2024-02-02" },
];

describe("clear", () => {
  it("removes todos whose done is true, preserving order", () => {
    const out = clear(sample());
    expect(out.map((t) => t.id)).toEqual([2, 4]);
  });

  it("does not mutate the input", () => {
    const input = sample();
    clear(input);
    expect(input).toEqual(sample());
  });

  it("returns empty for empty input and keeps all when none done", () => {
    expect(clear([])).toEqual([]);
    const none: Todo[] = [{ id: 1, title: "x", done: false }];
    expect(clear(none)).toEqual(none);
  });

  it("run with clear command persists the filtered list", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    save(path, sample());
    const msg = run(path, { kind: "clear" });
    expect(typeof msg).toBe("string");
    expect(load(path).map((t) => t.id)).toEqual([2, 4]);
  });
});
