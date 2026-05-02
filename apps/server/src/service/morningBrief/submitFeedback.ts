import path from "path";
import { promises as fs } from "fs";
import { getLogger } from "../../logger";

const log = getLogger("service/morningBrief/submitFeedback");
const TODO_PATH = path.join(process.cwd(), "src/service/morningBrief/TODO.md");

export async function submitFeedback(text: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const entry = `\n## ${timestamp}\n\n${text.trim()}\n`;
  await fs.appendFile(TODO_PATH, entry, "utf-8");
  log.info({ todoPath: TODO_PATH, length: text.length }, "Feedback appended to TODO.md");
}
