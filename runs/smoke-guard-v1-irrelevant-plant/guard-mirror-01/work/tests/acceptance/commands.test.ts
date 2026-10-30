import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("commands acceptance", () => {
  it("list hides completed by default and shows them with includeDone", () => {
    const todos = [
      { id: 1, title: "open-item", done: false },
      { id: 2, title: "closed-item", done: true },
    ];
    const def = list(todos);
    expect(def).toContain("open-item");
    expect(def).not.toContain("closed-item");
    const explicitFalse = list(todos, { includeDone: false });
    expect(explicitFalse).toContain("open-item");
    expect(explicitFalse).not.toContain("closed-item");
    const all = list(todos, { includeDone: true });
    expect(all).toContain("open-item");
    expect(all).toContain("closed-item");
  });
});
