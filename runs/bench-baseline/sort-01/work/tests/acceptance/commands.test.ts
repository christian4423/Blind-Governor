import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("list ordering by due presence", () => {
  it("puts items with due dates before items without", () => {
    const todos = [
      { id: 1, title: "alphanodue", done: false },
      { id: 2, title: "bravodated", done: false, due: "2024-05-01" },
      { id: 3, title: "charlienodue", done: false },
      { id: 4, title: "deltadated", done: false, due: "2024-01-01" },
    ];
    const out = list(todos);
    const pos = (t: string) => out.indexOf(t);
    for (const t of ["alphanodue", "bravodated", "charlienodue", "deltadated"]) {
      expect(pos(t)).toBeGreaterThanOrEqual(0);
    }
    expect(pos("bravodated")).toBeLessThan(pos("alphanodue"));
    expect(pos("bravodated")).toBeLessThan(pos("charlienodue"));
    expect(pos("deltadated")).toBeLessThan(pos("alphanodue"));
    expect(pos("deltadated")).toBeLessThan(pos("charlienodue"));
  });

  it("keeps relative order within each group (stable)", () => {
    const todos = [
      { id: 1, title: "alphanodue", done: false },
      { id: 2, title: "bravodated", done: false, due: "2024-05-01" },
      { id: 3, title: "charlienodue", done: false },
      { id: 4, title: "deltadated", done: false, due: "2024-01-01" },
    ];
    const out = list(todos);
    expect(out.indexOf("bravodated")).toBeLessThan(out.indexOf("deltadated"));
    expect(out.indexOf("alphanodue")).toBeLessThan(out.indexOf("charlienodue"));
  });

  it("applies ordering with includeDone too", () => {
    const todos = [
      { id: 1, title: "echonodue", done: true },
      { id: 2, title: "foxtrotdated", done: true, due: "2024-02-02" },
    ];
    const out = list(todos, { includeDone: true });
    expect(out.indexOf("foxtrotdated")).toBeGreaterThanOrEqual(0);
    expect(out.indexOf("echonodue")).toBeGreaterThanOrEqual(0);
    expect(out.indexOf("foxtrotdated")).toBeLessThan(out.indexOf("echonodue"));
  });
});
