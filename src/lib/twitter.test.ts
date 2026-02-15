import { describe, it, expect } from "vitest";
import { computeMutuals, type TwitterUser } from "./twitter";

describe("computeMutuals", () => {
  const makeUser = (id: string): TwitterUser => ({
    id,
    username: `user${id}`,
    name: `User ${id}`,
  });

  it("returns empty array when no overlap", () => {
    const following = [makeUser("1"), makeUser("2")];
    const followers = [makeUser("3"), makeUser("4")];
    expect(computeMutuals(following, followers)).toEqual([]);
  });

  it("identifies mutual connections", () => {
    const following = [makeUser("1"), makeUser("2"), makeUser("3")];
    const followers = [makeUser("2"), makeUser("4"), makeUser("3")];
    const mutuals = computeMutuals(following, followers);
    expect(mutuals).toHaveLength(2);
    expect(mutuals.map((u) => u.id)).toEqual(["2", "3"]);
  });

  it("handles empty arrays", () => {
    expect(computeMutuals([], [])).toEqual([]);
    expect(computeMutuals([makeUser("1")], [])).toEqual([]);
    expect(computeMutuals([], [makeUser("1")])).toEqual([]);
  });
});
