import { describe, it, expect } from "vitest";
import { formatTodo, formatList } from "../../src/format";

describe("format with completed", () => {
  it("marks completed todos with [x]", () => {
    expect(formatTodo({ id: 2, title: "walk dog", completed: true }).startsWith("[x] walk dog")).toBe(true);
    expect(formatTodo({ id: 1, title: "buy milk", completed: false }).startsWith("[ ] buy milk")).toBe(true);
  });
  it("formatList uses completed", () => {
    const out = formatList([
      { id: 1, title: "buy milk", completed: false },
      { id: 2, title: "walk dog", completed: true },
    ]);
    expect(out).toContain("[ ] buy milk");
    expect(out).toContain("[x] walk dog");
  });
});
