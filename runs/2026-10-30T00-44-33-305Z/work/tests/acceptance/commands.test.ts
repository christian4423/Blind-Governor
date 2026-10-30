import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { list, parseArgs, run } from "../../src/commands";
import { save } from "../../src/storage";

const todos = [
  { id: 1, title: "buy milk", done: false, due: "2024-05-01" },
  { id: 2, title: "call mom", done: false },
];

describe("list --verbose", () => {
  it("parses --verbose", () => {
    expect(parseArgs(["list", "--verbose"])).toEqual({ kind: "list", verbose: true });
  });
  it("parses plain list", () => {
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
  it("verbose list shows id and due", () => {
    const out = list(todos, { verbose: true });
    expect(out).toContain("[id: 1] [due: 2024-05-01]");
    expect(out).toContain("[id: 2] [due: none]");
  });
  it("non-verbose list does not show verbose suffix", () => {
    const out = list(todos);
    expect(out).not.toContain("[id: 1]");
    expect(out).not.toContain("[due:");
  });
  it("run honours verbose", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-verbose-"));
    const path = join(dir, "todos.json");
    save(path, todos);
    const out = run(path, { kind: "list", verbose: true });
    expect(out).toContain("[id: 1] [due: 2024-05-01]");
  });
});
