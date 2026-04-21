import fs from "fs";
import path from "path";
import { getLogger } from "../../logger";

const log = getLogger("service/morningBrief/personalContext");

const CONTEXT_PATH = path.join(__dirname, "../../../context/personalContext.md");
const EXAMPLE_PATH = path.join(__dirname, "../../../context/personalContext.example.md");

function load(): string {
  if (fs.existsSync(CONTEXT_PATH)) {
    log.info({ path: CONTEXT_PATH }, "Loaded personalContext.md");
    return fs.readFileSync(CONTEXT_PATH, "utf-8");
  }
  log.warn("personalContext.md not found, falling back to example file");
  return fs.readFileSync(EXAMPLE_PATH, "utf-8");
}

export const personalContext: string = load();
