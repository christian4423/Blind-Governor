import { describe, it, expect } from "vitest";
import { formatTodo } from "../../src/format";

describe("format with completed", () => {
  it("renders completed and open todos differently", () => {
    const a = formatTodo({ id: 1, title: "x", completed: true });
    const b = formatTodo({ id: 1, title: "x", completed: false });
    expect(a).not.toBe(b);
    expect(a).toContain("x");
  });
});
