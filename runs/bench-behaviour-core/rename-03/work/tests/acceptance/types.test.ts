import { describe, it, expect } from "vitest";
import { type Todo, nextId } from "../../src/types";

describe("Todo.completed", () => {
  it("uses completed instead of done", () => {
    const t: Todo = { id: 1, title: "x", completed: true };
    expect(t.completed).toBe(true);
    expect("done" in t).toBe(false);
    expect(nextId([t])).toBeGreaterThan(1);
  });
});
