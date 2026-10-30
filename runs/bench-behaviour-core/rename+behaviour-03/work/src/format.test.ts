import { describe, expect, it } from "vitest";
import { formatList, formatTodo } from "./format";

describe("format", () => {
  it("formats open and done todos", () => {
    expect(formatTodo({ id: 1, title: "milk", completed: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", completed: true })).toBe("[x] eggs");
  });
  it("handles an empty list", () => expect(formatList([])).toBe("No todos."));
  it("formats a list of todos joined by newlines", () => {
    expect(
      formatList([
        { id: 1, title: "milk", completed: false },
        { id: 2, title: "eggs", completed: true },
      ]),
    ).toBe("[ ] milk\n[x] eggs");
  });
});
