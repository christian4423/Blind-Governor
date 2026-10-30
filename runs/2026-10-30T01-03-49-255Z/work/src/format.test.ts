import { describe, expect, it } from "vitest";
import { formatList, formatTodo } from "./format";

describe("format", () => {
  it("formats open and completed todos", () => {
    expect(formatTodo({ id: 1, title: "milk", completed: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", completed: true })).toBe("[x] eggs");
  });
  it("formats a list", () => {
    expect(
      formatList([
        { id: 1, title: "milk", completed: true },
        { id: 2, title: "eggs", completed: false },
      ]),
    ).toBe("[x] milk\n[ ] eggs");
  });
  it("handles an empty list", () => expect(formatList([])).toBe("No todos."));
});
