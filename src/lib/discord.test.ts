import { describe, it, expect } from "vitest";
import { getDiscordAvatarUrl, getGuildIconUrl } from "./discord";

describe("getDiscordAvatarUrl", () => {
  it("returns default avatar when no hash", () => {
    const url = getDiscordAvatarUrl("123456789012345678", null);
    expect(url).toContain("embed/avatars/");
  });

  it("returns png for non-animated avatars", () => {
    const url = getDiscordAvatarUrl("123", "abc123");
    expect(url).toBe("https://cdn.discordapp.com/avatars/123/abc123.png");
  });

  it("returns gif for animated avatars", () => {
    const url = getDiscordAvatarUrl("123", "a_abc123");
    expect(url).toBe("https://cdn.discordapp.com/avatars/123/a_abc123.gif");
  });
});

describe("getGuildIconUrl", () => {
  it("returns null when no icon hash", () => {
    expect(getGuildIconUrl("123", null)).toBeNull();
  });

  it("returns icon URL when hash exists", () => {
    const url = getGuildIconUrl("123", "icon123");
    expect(url).toBe("https://cdn.discordapp.com/icons/123/icon123.png");
  });
});
