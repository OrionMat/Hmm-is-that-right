import { promises as fs } from "fs";
import path from "path";
import { getLogger } from "../../logger";
import { PaperOfYear } from "../../dataModel/dataModel";

const log = getLogger("service/paperOfYear/diskCache");

const CACHE_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(CACHE_DIR, "paper-of-year.json");

interface DiskEntry {
  key: string;
  value: PaperOfYear;
  expiresAt: number;
}

export async function loadPaperFromDisk(key: string): Promise<PaperOfYear | null> {
  let raw: string;
  try {
    raw = await fs.readFile(CACHE_FILE, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      log.warn({ err }, "Failed to read paper-of-year disk cache");
    }
    return null;
  }

  let entry: DiskEntry;
  try {
    entry = JSON.parse(raw) as DiskEntry;
  } catch (err) {
    log.warn({ err }, "Paper-of-year disk cache is malformed JSON");
    return null;
  }

  if (entry.key !== key) return null;
  if (Date.now() > entry.expiresAt) return null;

  return entry.value;
}

export async function savePaperToDisk(key: string, paper: PaperOfYear, ttlMs: number): Promise<void> {
  const entry: DiskEntry = { key, value: paper, expiresAt: Date.now() + ttlMs };
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(entry, null, 2), "utf-8");
  } catch (err) {
    log.warn({ err }, "Failed to write paper-of-year disk cache");
  }
}
