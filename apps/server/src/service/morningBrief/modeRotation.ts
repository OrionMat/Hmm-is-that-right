import { LongformMode } from "../../dataModel/dataModel";

const MODES: LongformMode[] = ["zoom-in", "zoom-out", "inversion"];

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function getModeForDate(d = new Date()): LongformMode {
  return MODES[dayOfYear(d) % 3];
}
