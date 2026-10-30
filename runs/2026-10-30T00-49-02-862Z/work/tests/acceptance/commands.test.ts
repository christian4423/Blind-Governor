import { describe, it, expect } from "vitest";
import { list, parseArgs } from "../../src/commands";

const todos = [
  { id: 1, title: "Walk dog", done: false },
  { id: 3, title: "Buy milk", done: true, due: "2024-06-01" },
];

describe("list --verbose", () => {
  it("parses --verbose", () => {
    expect(parseArgs(["list", "--verbose"])).toEqual({ kind: "list", verbose: true });
  });
  it("plain list parse unchanged", () => {
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
  it("verbose list shows all todos with all fields and summary", () => {
    expect(list(todos, { verbose: true })).toBe("#1 [ ] Walk dog\n#3 [x] Buy milk (due 2024-06-01)\n1 open, 1 done");
  });
  it("plain list does not include summary", () => {
    expect(list(todos)).not.toContain("open,");
  });
});
