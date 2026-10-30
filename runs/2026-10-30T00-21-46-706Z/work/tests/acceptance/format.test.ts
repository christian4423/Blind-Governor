import { describe, it } from "vitest";
import { formatList } from "../src/format";

describe("formatList", () => {
  const todos = [
    { id: 1, title: "Buy milk", done: false, due: "2024-01-01" },
    { id: 2, title: "Walk dog", done: true, due: undefined }
  ];

  it("formats list without verbose (simple titles only)", () => {
    const result = formatList(todos);
    expect(result).toContain("Buy milk");
    expect(result).toContain("Walk dog");
  });

  it("formats list with verbose=false", () => {
    const result = formatList(todos, false);
    expect(result).toContain("Buy milk");
  });

  it("formats list with verbose=true shows details", () => {
    const result = formatList(todos, true);
    expect(result).toContain("Buy milk");
    expect(result).toContain("id: 1");
    expect(result).toContain("done: false");
  });

  it("formats list with undefined verbose defaults to simple mode", () => {
    const result = formatList(todos);
    expect(result).toContain("Buy milk");
  });
});