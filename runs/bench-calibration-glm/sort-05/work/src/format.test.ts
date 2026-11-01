import { describe, expect, it } from "vitest";
import { formatList, formatTodo } from "./format";

describe("format", () => {
  it("formats open and done todos", () => {
    expect(formatTodo({ id: 1, title: "milk", done: false })).toBe("[ ] milk");
    expect(formatTodo({ id: 2, title: "eggs", done: true })).toBe("[x] eggs");
  });
  it("handles an empty list", () => expect(formatList([])).toBe("No todos."));
  it("renders dated todos before undated ones, keeping input order within each group", () => {
    const milk = { id: 1, title: "milk", done: false };
    const eggs = { id: 2, title: "eggs", done: true, due: "2024-03-01" };
    const bread = { id: 3, title: "bread", done: false };
    const rice = { id: 4, title: "rice", done: true, due: "2024-01-15" };
    // Dated todos come first in their input order (eggs before rice, even
    // though rice's due date is earlier — we partition, not sort by date),
    // then undated todos in their input order.
    expect(formatList([milk, eggs, bread, rice])).toBe(
      "[x] eggs\n[x] rice\n[ ] milk\n[ ] bread"
    );
  });
});
