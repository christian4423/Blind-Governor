import { describe, expect, it } from "vitest";
import { formatList } from "../../src/format";
import type { Todo } from "../../src/types";

describe("format.formatList due-date ordering (acceptance)", () => {
  it("renders todos with a due date before todos without one", () => {
    const todos: Todo[] = [
      { id: 1, title: "mow the lawn", done: false },
      { id: 2, title: "pay rent", done: false, due: "2030-01-01" },
    ];
    const out = formatList(todos);
    expect(out).toContain("pay rent");
    expect(out).toContain("mow the lawn");
    expect(out.indexOf("pay rent")).toBeLessThan(out.indexOf("mow the lawn"));
  });

  it("renders every dated todo before every undated todo", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha task", done: false },
      { id: 2, title: "beta task", done: false },
      { id: 3, title: "gamma task", done: false, due: "2030-01-01" },
      { id: 4, title: "delta task", done: false, due: "2031-01-01" },
    ];
    const out = formatList(todos);
    const lastDated = Math.max(out.indexOf("gamma task"), out.indexOf("delta task"));
    const firstUndated = Math.min(out.indexOf("alpha task"), out.indexOf("beta task"));
    expect(lastDated).toBeLessThan(firstUndated);
  });
});
