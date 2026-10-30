import { describe, it, expect } from "vitest";
import { nextId, type Todo } from "../../src/types";

describe("types uses completed", () => {
  it("nextId works with completed todos", () => {
    const todos: Todo[] = [
      { id: 3, title: "a", completed: false },
      { id: 7, title: "b", completed: true },
    ];
    expect(nextId(todos)).toBe(8);
  });
});
