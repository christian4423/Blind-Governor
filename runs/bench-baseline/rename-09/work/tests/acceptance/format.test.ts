import { describe, it, expect } from "vitest";
import { formatTodo, formatList } from "../../src/format";

describe("format uses completed", () => {
  it("renders completed and open todos differently", () => {
    const open = formatTodo({ id: 1, title: "x", completed: false });
    const closed = formatTodo({ id: 1, title: "x", completed: true });
    expect(open).not.toEqual(closed);
    expect(open).toContain("x");
    expect(closed).toContain("x");
  });
  it("formatList includes all titles", () => {
    const out = formatList([
      { id: 1, title: "alpha", completed: false },
      { id: 2, title: "beta", completed: true },
    ]);
    expect(out).toContain("alpha");
    expect(out).toContain("beta");
  });
});
