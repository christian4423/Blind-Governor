import { describe, expect, it } from "vitest";
import { nextId, type Command, type Todo } from "./types";

describe("nextId", () => {
  it("starts at 1", () => expect(nextId([])).toBe(1));
  it("is one past the max id", () => {
    expect(
      nextId([
        { id: 3, title: "a", completed: false },
        { id: 7, title: "b", completed: true },
      ]),
    ).toBe(8);
  });
});

describe("Todo", () => {
  it("uses the completed flag", () => {
    const t: Todo = { id: 1, title: "x", completed: true, due: "2026-11-01" };
    expect(t.completed).toBe(true);
  });
});

describe("Command", () => {
  it("accepts the clear variant", () => {
    const cmd: Command = { kind: "clear" };
    expect(cmd.kind).toBe("clear");
  });
});
