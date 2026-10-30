import { describe, it, expect } from "vitest";
import { formatTodo, formatList } from "../../src/format";

describe("format with completed", () => {
  it("renders completed todos with [x]", () => {
    expect(formatTodo({ id: 2, title: "walk dog", completed: true })).toContain("[x] walk dog");
  });
  it("renders open todos with [ ]", () => {
    expect(formatTodo({ id: 1, title: "buy milk", completed: false })).toContain("[ ] buy milk");
  });
  it("formatList includes both", () => {
    const out = formatList([
      { id: 1, title: "a", completed: false },
      { id: 2, title: "b", completed: true },
    ]);
    expect(out).toContain("[ ] a");
    expect(out).toContain("[x] b");
  });
});
