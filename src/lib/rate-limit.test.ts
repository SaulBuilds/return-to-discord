import { describe, it, expect } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const key = `test-${Date.now()}`;
    const result = rateLimit(key, 5, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests exceeding limit", () => {
    const key = `test-block-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 60_000);
    }
    const result = rateLimit(key, 3, 60_000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("decrements remaining correctly", () => {
    const key = `test-dec-${Date.now()}`;
    expect(rateLimit(key, 5, 60_000).remaining).toBe(4);
    expect(rateLimit(key, 5, 60_000).remaining).toBe(3);
    expect(rateLimit(key, 5, 60_000).remaining).toBe(2);
  });
});
