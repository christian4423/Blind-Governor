import { describe, expect, it } from "vitest";
import type { Todo } from "./types";
import { formatList, formatTodo } from "./format";

describe("format", () => {
  it("formats open and done todos", () => {
    expect(formatTodo({ id: 1, title: "milk", done: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", done: true })).toBe("[x] eggs");
  });
  it("handles an empty list", () => expect(formatList([])).toBe("No todos."));
  it("renders todos with a due date before those without, preserving order", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: false, due: "2025-01-01" },
      { id: 3, title: "charlie", done: false },
      { id: 4, title: "delta", done: false, due: "2024-12-31" },
    ];
    // Not sorted by due-date value: "bravo" (2025) still precedes "delta" (2024).
    expect(formatList(todos)).toBe("[ ] bravo\n[ ] delta\n[ ] alpha\n[ ] charlie");
  });
  it("treats an explicitly undefined due date as no due date", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha", done: true, due: undefined },
      { id: 2, title: "bravo", done: false, due: "2025-03-05" },
    ];
    expect(formatList(todos)).toBe("[ ] bravo\n[x] alpha");
  });
});
