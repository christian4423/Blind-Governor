import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list orders due-dated items first", () => {
  const todos: Todo[] = [
    { id: 1, title: "alphanodue", done: false },
    { id: 2, title: "bravodue", done: false, due: "2024-05-01" },
    { id: 3, title: "charlienodue", done: false },
    { id: 4, title: "deltadue", done: false, due: "2024-01-01" },
  ];

  it("places todos with a due date before todos without", () => {
    const out = list(todos);
    const pos = (t: string) => out.indexOf(t);
    for (const t of ["alphanodue", "bravodue", "charlienodue", "deltadue"]) {
      expect(pos(t)).toBeGreaterThanOrEqual(0);
    }
    expect(pos("bravodue")).toBeLessThan(pos("alphanodue"));
    expect(pos("bravodue")).toBeLessThan(pos("charlienodue"));
    expect(pos("deltadue")).toBeLessThan(pos("alphanodue"));
    expect(pos("deltadue")).toBeLessThan(pos("charlienodue"));
  });

  it("keeps relative order of undated todos", () => {
    const out = list(todos);
    expect(out.indexOf("alphanodue")).toBeLessThan(out.indexOf("charlienodue"));
  });

  it("does not mutate the input array", () => {
    const copy = todos.map((t) => ({ ...t }));
    list(todos);
    expect(todos).toEqual(copy);
  });
});
