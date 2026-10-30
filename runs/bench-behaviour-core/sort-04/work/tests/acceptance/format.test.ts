import { describe, it, expect } from "vitest";
import { formatList } from "../../src/format";

describe("formatList due-date ordering", () => {
  it("renders todos with due dates before todos without, keeping relative order within each group", () => {
    const todos = [
      { id: 1, title: "AlphaNoDue", done: false },
      { id: 2, title: "BravoDue", done: false, due: "2030-05-01" },
      { id: 3, title: "CharlieNoDue", done: false },
      { id: 4, title: "DeltaDue", done: false, due: "2020-01-01" },
    ];
    const out = formatList(todos);
    const pos = (t: string) => out.indexOf(t);
    for (const t of ["AlphaNoDue", "BravoDue", "CharlieNoDue", "DeltaDue"]) {
      expect(pos(t)).toBeGreaterThanOrEqual(0);
    }
    expect(pos("BravoDue")).toBeLessThan(pos("DeltaDue"));
    expect(pos("DeltaDue")).toBeLessThan(pos("AlphaNoDue"));
    expect(pos("AlphaNoDue")).toBeLessThan(pos("CharlieNoDue"));
  });

  it("does not mutate the input array", () => {
    const todos = [
      { id: 1, title: "A", done: false },
      { id: 2, title: "B", done: false, due: "2030-05-01" },
    ];
    const copy = todos.map((t) => ({ ...t }));
    formatList(todos);
    expect(todos).toEqual(copy);
  });
});
