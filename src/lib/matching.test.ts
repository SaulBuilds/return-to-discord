import { describe, it, expect } from "vitest";
import { computeScore, getStrengthLevel } from "./matching";

describe("computeScore", () => {
  it("returns 0 for no connections", () => {
    expect(computeScore(0, "none")).toBe(0);
  });

  it("scores shared guilds at 10 pts each", () => {
    expect(computeScore(1, "none")).toBe(10);
    expect(computeScore(3, "none")).toBe(30);
  });

  it("caps guild points at 50", () => {
    expect(computeScore(6, "none")).toBe(50);
    expect(computeScore(10, "none")).toBe(50);
  });

  it("scores Twitter mutual at 40 pts", () => {
    expect(computeScore(0, "mutual")).toBe(40);
  });

  it("scores Twitter following at 15 pts", () => {
    expect(computeScore(0, "following")).toBe(15);
  });

  it("scores Twitter follower at 10 pts", () => {
    expect(computeScore(0, "follower")).toBe(10);
  });

  it("combines guild and Twitter scores", () => {
    expect(computeScore(3, "mutual")).toBe(70); // 30 + 40
    expect(computeScore(2, "following")).toBe(35); // 20 + 15
    expect(computeScore(5, "follower")).toBe(60); // 50 + 10
  });

  it("caps total score at 100", () => {
    expect(computeScore(10, "mutual")).toBe(90); // 50 + 40
    expect(computeScore(6, "mutual")).toBe(90); // 50 + 40
  });
});

describe("getStrengthLevel", () => {
  it("returns 'high' for score >= 70", () => {
    expect(getStrengthLevel(70)).toBe("high");
    expect(getStrengthLevel(100)).toBe("high");
    expect(getStrengthLevel(85)).toBe("high");
  });

  it("returns 'medium' for score 40-69", () => {
    expect(getStrengthLevel(40)).toBe("medium");
    expect(getStrengthLevel(69)).toBe("medium");
    expect(getStrengthLevel(55)).toBe("medium");
  });

  it("returns 'low' for score < 40", () => {
    expect(getStrengthLevel(0)).toBe("low");
    expect(getStrengthLevel(39)).toBe("low");
    expect(getStrengthLevel(10)).toBe("low");
  });
});
