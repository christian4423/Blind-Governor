import { describe, it, expect } from "vitest";
import { nextId, type Todo } from "../../src/types";

describe("Todo.completed", () => {
  it("nextId works with todos using completed", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", completed: false },
      { id: 2, title: "b", completed: true },
    ];
    expect(nextId(todos)).toBe(3);
  });
});
