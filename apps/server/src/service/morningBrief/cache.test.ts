import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { cacheKey, cacheGet, cacheSet } from "./cache";

describe("cache", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns undefined for a key that was never set", () => {
    expect(cacheGet("missing")).toBeUndefined();
  });

  it("returns stored value before TTL expires", () => {
    cacheSet("k1", { data: 42 }, 5000);
    expect(cacheGet("k1")).toEqual({ data: 42 });
  });

  it("returns undefined after TTL expires", () => {
    cacheSet("k2", "hello", 1000);
    vi.advanceTimersByTime(1001);
    expect(cacheGet("k2")).toBeUndefined();
  });

  it("overwrites an existing entry", () => {
    cacheSet("k3", "first", 5000);
    cacheSet("k3", "second", 5000);
    expect(cacheGet("k3")).toBe("second");
  });

  describe("cacheKey", () => {
    it("builds key without mode", () => {
      expect(cacheKey("2026-04-21", "world")).toBe("2026-04-21:world");
    });

    it("builds key with mode", () => {
      expect(cacheKey("2026-04-21", "longform", "zoom-in")).toBe("2026-04-21:longform:zoom-in");
    });
  });
});
