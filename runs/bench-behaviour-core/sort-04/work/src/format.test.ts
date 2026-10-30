import { describe, expect, it } from "vitest";
import { formatList, formatTodo } from "./format";
import type { Todo } from "./types";

describe("format", () => {
  it("formats open and done todos", () => {
    expect(formatTodo({ id: 1, title: "milk", done: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", done: true })).toBe("[x] eggs");
  });
  it("handles an empty list", () => expect(formatList([])).toBe("No todos."));

  it("renders dated todos before undated ones as a stable partition", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: true, due: "2024-12-31" },
      { id: 3, title: "c", done: false },
      { id: 4, title: "d", done: false, due: "2024-01-01" },
      { id: 5, title: "e", done: true },
    ];
    expect(formatList(todos)).toBe(
      ["[x] b", "[ ] d", "[ ] a", "[ ] c", "[x] e"].join("\n"),
    );
  });

  it("treats an empty due string as undated", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", done: false, due: "" },
      { id: 2, title: "b", done: false, due: "2024-05-05" },
    ];
    expect(formatList(todos)).toBe("[ ] b\n[ ] a");
  });

  it("keeps original order when no todos have due dates", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: true },
    ];
    expect(formatList(todos)).toBe("[ ] a\n[x] b");
  });

  it("does not mutate the input array", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: false, due: "2024-01-01" },
    ];
    const snapshot = todos.map((t) => ({ ...t }));
    const ref = [...todos];
    formatList(todos);
    expect(todos).toEqual(snapshot);
    todos.forEach((t, i) => expect(t).toBe(ref[i]));
  });
});
