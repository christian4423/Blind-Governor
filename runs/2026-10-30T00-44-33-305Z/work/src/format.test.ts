import { describe, expect, it } from "vitest";
import { formatList, formatTodo } from "./format";

describe("format", () => {
  it("formats open and done todos", () => {
    expect(formatTodo({ id: 1, title: "milk", done: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", done: true })).toBe("[x] eggs");
  });
  it("handles an empty list", () => expect(formatList([])).toBe("No todos."));
  it("non-verbose output unchanged when opts given", () => {
    const t = { id: 1, title: "milk", done: false, due: "2024-01-01" };
    expect(formatTodo(t, {})).toBe("[ ] milk");
    expect(formatTodo(t, { verbose: false })).toBe("[ ] milk");
    expect(formatList([t], { verbose: false })).toBe("[ ] milk");
  });
  it("verbose formatTodo appends id and due", () => {
    const t = { id: 3, title: "bread", done: true, due: "2024-05-01" };
    expect(formatTodo(t, { verbose: true })).toBe(formatTodo(t) + " [id: 3] [due: 2024-05-01]");
    expect(formatTodo({ id: 4, title: "jam", done: false }, { verbose: true })).toBe(
      "[ ] jam [id: 4] [due: none]",
    );
  });
  it("verbose formatList uses verbose formatTodo", () => {
    const todos = [
      { id: 1, title: "milk", done: false },
      { id: 2, title: "eggs", done: true, due: "2024-02-02" },
    ];
    expect(formatList(todos, { verbose: true })).toBe(
      "[ ] milk [id: 1] [due: none]\n[x] eggs [id: 2] [due: 2024-02-02]",
    );
    expect(formatList(todos)).toBe("[ ] milk\n[x] eggs");
    expect(formatList([], { verbose: true })).toBe("No todos.");
  });
});
