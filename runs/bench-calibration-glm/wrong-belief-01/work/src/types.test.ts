import { describe, expect, it } from "vitest";
import { nextId, type Command } from "./types";

describe("nextId", () => {
  it("starts at 1", () => expect(nextId([])).toBe(1));
  it("is one past the max id", () => {
    expect(nextId([{ id: 3, title: "a", done: false }, { id: 7, title: "b", done: true }])).toBe(8);
  });
});

describe("Command", () => {
  it("includes a no-payload clear variant", () => {
    const cmd: Command = { kind: "clear" };
    expect(cmd.kind).toBe("clear");
  });
});
