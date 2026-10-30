import { describe, expect, it } from "vitest";
import { formatList, formatTodo } from "./format";

describe("format", () => {
  it("formats open and done todos", () => {
    expect(formatTodo({ id: 1, title: "milk", done: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", done: true })).toBe("[x] eggs");
  });
  it("handles an empty list", () => expect(formatList([])).toBe("No todos."));
});
