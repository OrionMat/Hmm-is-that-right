import { describe, it, expect } from "vitest";
import { getModeForDate } from "./modeRotation";
import { LongformMode } from "../../dataModel/dataModel";

describe("getModeForDate", () => {
  it("returns one of the three valid modes", () => {
    const valid: LongformMode[] = ["zoom-in", "zoom-out", "inversion"];
    expect(valid).toContain(getModeForDate(new Date("2026-01-01")));
  });

  it("cycles through all three modes across consecutive days", () => {
    const modes = [0, 1, 2].map((offset) => {
      const d = new Date("2026-01-01");
      d.setDate(d.getDate() + offset);
      return getModeForDate(d);
    });
    expect(new Set(modes).size).toBe(3);
  });

  it("returns the same mode for the same date", () => {
    const d1 = new Date("2026-04-15");
    const d2 = new Date("2026-04-15");
    expect(getModeForDate(d1)).toBe(getModeForDate(d2));
  });

  it("defaults to today when no argument passed", () => {
    const valid: LongformMode[] = ["zoom-in", "zoom-out", "inversion"];
    expect(valid).toContain(getModeForDate());
  });
});
