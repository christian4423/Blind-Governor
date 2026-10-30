import { describe, it, expect } from "vitest";
import { nextId, type Todo } from "../../src/types";

describe("Todo.completed", () => {
  it("Todo uses completed field", () => {
    const t: Todo = { id: 1, title: "a", completed: true };
    expect(t.completed).toBe(true);
    expect(nextId([t])).toBeGreaterThan(1);
  });
});
