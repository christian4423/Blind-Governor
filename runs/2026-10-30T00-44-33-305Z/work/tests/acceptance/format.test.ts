import { describe, it, expect } from "vitest";
import { formatTodo, formatList } from "../../src/format";

describe("format verbose", () => {
  const a = { id: 3, title: "buy milk", done: false, due: "2024-05-01" };
  const b = { id: 4, title: "call mom", done: false };
  it("appends id and due in verbose mode", () => {
    expect(formatTodo(a, { verbose: true })).toBe(formatTodo(a) + " [id: 3] [due: 2024-05-01]");
  });
  it("uses none when no due date", () => {
    expect(formatTodo(b, { verbose: true })).toBe(formatTodo(b) + " [id: 4] [due: none]");
  });
  it("non-verbose is unchanged", () => {
    expect(formatTodo(a, { verbose: false })).toBe(formatTodo(a));
    expect(formatTodo(a, {})).toBe(formatTodo(a));
    expect(formatList([a, b], {})).toBe(formatList([a, b]));
  });
  it("formatList verbose renders verbose lines", () => {
    const out = formatList([a, b], { verbose: true });
    expect(out).toContain(formatTodo(a, { verbose: true }));
    expect(out).toContain(formatTodo(b, { verbose: true }));
  });
});
