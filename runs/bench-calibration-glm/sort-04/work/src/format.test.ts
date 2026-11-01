import { describe, expect, it } from "vitest";
import { formatList, formatTodo } from "./format";

describe("format", () => {
  it("formats open and done todos", () => {
    expect(formatTodo({ id: 1, title: "milk", done: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", done: true })).toBe("[x] eggs");
  });
  it("handles an empty list", () => expect(formatList([])).toBe("No todos."));
  it("renders dated todos first, preserving order within groups", () => {
    const todos = [
      { id: 1, title: "A", done: false },
      { id: 2, title: "X", done: false, due: "2024-01-02" },
      { id: 3, title: "B", done: true },
      { id: 4, title: "Y", done: false, due: "2024-01-01" },
      { id: 5, title: "C", done: false, due: "" },
    ];
    expect(formatList(todos)).toBe(
      "[ ] X\n[ ] Y\n[ ] A\n[x] B\n[ ] C"
    );
  });
});
