import { describe, expect, it } from "vitest";
import { formatList, formatTodo } from "./format";

describe("format", () => {
  it("formats open and done todos", () => {
    expect(formatTodo({ id: 1, title: "milk", done: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", done: true })).toBe("[x] eggs");
  });
  it("handles an empty list", () => { expect(formatList([])).toBe("No todos."); });
  it("formats with verbose option", () => {
    expect(formatTodo({ id: 1, title: "milk", done: false }, true)).toBe("[ ] milk (id: 1)");
    expect(formatTodo({ id: 2, title: "eggs", done: true, due: "2024-01-01" }, true)).toBe("[x] eggs (id: 2, due: 2024-01-01)");
  });
  it("formats list with verbose option", () => {
    expect(formatList([{ id: 1, title: "milk", done: false }], true)).toBe("[ ] milk (id: 1)");
    expect(formatList([{ id: 1, title: "milk", done: false }, { id: 2, title: "eggs", done: true, due: "2024-01-01" }], true)).toBe("[ ] milk (id: 1)\n[x] eggs (id: 2, due: 2024-01-01)");
  });
});
