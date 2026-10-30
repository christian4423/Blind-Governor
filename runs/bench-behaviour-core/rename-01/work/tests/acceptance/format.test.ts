import { describe, it, expect } from "vitest";
import { formatTodo, formatList } from "../../src/format";

describe("format uses completed", () => {
  it("renders completed and open todos differently", () => {
    const open = formatTodo({ id: 1, title: "x", completed: false });
    const closed = formatTodo({ id: 1, title: "x", completed: true });
    expect(open).not.toBe(closed);
    expect(open).toContain("x");
    expect(closed).toContain("x");
  });
  it("formats a list", () => {
    const out = formatList([{ id: 1, title: "a", completed: false }, { id: 2, title: "b", completed: true }]);
    expect(out).toContain("a");
    expect(out).toContain("b");
  });
});
