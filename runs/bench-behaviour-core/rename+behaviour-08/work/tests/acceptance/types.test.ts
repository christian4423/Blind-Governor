import { describe, it, expect } from "vitest";
import { nextId, type Todo } from "../../src/types";

describe("Todo.completed", () => {
  it("uses completed field", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", completed: false },
      { id: 4, title: "b", completed: true, due: "2026-01-01" },
    ];
    expect(todos[1].completed).toBe(true);
    expect(nextId(todos)).toBe(5);
  });
});
