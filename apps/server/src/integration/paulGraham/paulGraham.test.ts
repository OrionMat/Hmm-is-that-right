import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logger.ts");

const { mockAxiosGet } = vi.hoisted(() => {
  const mockAxiosGet = vi.fn();
  return { mockAxiosGet };
});

vi.mock("axios", () => ({
  default: { get: mockAxiosGet },
}));

import { listEssays } from "./paulGraham";

beforeEach(() => vi.clearAllMocks());

const SAMPLE_HTML = `
<html><body>
<table>
  <tr><td><a href="smart.html">Be Relentlessly Resourceful</a></td></tr>
  <tr><td><a href="mean.html">Mean People Fail</a></td></tr>
  <tr><td><a href="entities.html">Lisp &amp; Essays</a></td></tr>
</table>
</body></html>
`;

describe("listEssays", () => {
  it("returns parsed essays with absolute URLs", async () => {
    mockAxiosGet.mockResolvedValue({ data: SAMPLE_HTML });

    const essays = await listEssays();

    expect(essays.length).toBeGreaterThanOrEqual(2);
    expect(essays[0]).toMatchObject({
      url: "https://paulgraham.com/smart.html",
      title: "Be Relentlessly Resourceful",
    });
    expect(essays[1]).toMatchObject({
      url: "https://paulgraham.com/mean.html",
      title: "Mean People Fail",
    });
  });

  it("decodes HTML entities in titles", async () => {
    mockAxiosGet.mockResolvedValue({ data: SAMPLE_HTML });

    const essays = await listEssays();
    const entityEssay = essays.find((e) => e.url.includes("entities.html"));

    expect(entityEssay?.title).toBe("Lisp & Essays");
  });

  it("returns empty array on network failure", async () => {
    mockAxiosGet.mockRejectedValue(new Error("network timeout"));

    const essays = await listEssays();

    expect(essays).toEqual([]);
  });

  it("returns empty array when HTML has no matching links", async () => {
    mockAxiosGet.mockResolvedValue({ data: "<html><body>no links</body></html>" });

    const essays = await listEssays();

    expect(essays).toEqual([]);
  });

  it("sends a User-Agent header", async () => {
    mockAxiosGet.mockResolvedValue({ data: SAMPLE_HTML });

    await listEssays();

    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ "User-Agent": expect.any(String) }),
      }),
    );
  });
});
