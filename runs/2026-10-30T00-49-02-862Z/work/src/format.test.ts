import { describe, expect, it } from "vitest";
import { formatList, formatListVerbose, formatTodo, formatTodoVerbose } from "./format";

describe("format", () => {
  it("formats open and done todos", () => {
    expect(formatTodo({ id: 1, title: "milk", done: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", done: true })).toBe("[x] eggs");
  });
  it("handles an empty list", () => expect(formatList([])).toBe("No todos."));
});

describe("verbose format", () => {
  it("formats a todo with id and optional due", () => {
    expect(formatTodoVerbose({ id: 1, title: "Walk dog", done: false })).toBe("#1 [ ] Walk dog");
    expect(
      formatTodoVerbose({ id: 3, title: "Buy milk", done: true, due: "2024-06-01" }),
    ).toBe("#3 [x] Buy milk (due 2024-06-01)");
  });
  it("formats a list with summary", () => {
    expect(
      formatListVerbose([
        { id: 1, title: "Walk dog", done: false },
        { id: 3, title: "Buy milk", done: true, due: "2024-06-01" },
        { id: 2, title: "Read", done: false },
      ]),
    ).toBe("#1 [ ] Walk dog\n#3 [x] Buy milk (due 2024-06-01)\n#2 [ ] Read\n2 open, 1 done");
  });
  it("handles an empty list", () => expect(formatListVerbose([])).toBe("0 open, 0 done"));
});
