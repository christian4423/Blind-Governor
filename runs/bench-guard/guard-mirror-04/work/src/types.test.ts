import { describe, expect, it } from "vitest";
import { nextId } from "./types";

describe("nextId", () => {
  it("starts at 1", () => expect(nextId([])).toBe(1));
  it("is one past the max id", () => {
    expect(nextId([{ id: 3, title: "a", completed: false }, { id: 7, title: "b", completed: true }])).toBe(8);
  });
});
