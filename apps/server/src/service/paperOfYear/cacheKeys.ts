export function getMondayCacheKey(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - daysToMonday);
  const dateStr = monday.toISOString().split("T")[0];
  return `paper-of-year:${dateStr}`;
}

export function paperBodyCacheKey(arxivId: string): string {
  return `paper-body:${arxivId}`;
}
