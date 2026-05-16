export interface SseEvent {
  event: string;
  data: object;
}

const WORLD_ITEM_1_URL = "https://bbc.co.uk/climate-summit";
const WORLD_ITEM_2_URL = "https://apnews.com/un-security-council";
const TECH_ITEM_1_URL = "https://techcrunch.com/ai-regulation-bill";
const TECH_ITEM_2_URL = "https://openai.com/new-model";
const LONGFORM_ITEM_URL = "https://theatlantic.com/data-centers";

export const HAPPY_PATH_SSE_EVENTS: SseEvent[] = [
  // Section starts
  { event: "section_start", data: { section: "world" } },
  { event: "section_start", data: { section: "tech" } },
  { event: "section_start", data: { section: "longform" } },

  // World section complete — items arrive with empty summary (chunks follow)
  {
    event: "section_complete",
    data: {
      section: "world",
      items: [
        {
          title: "Global Climate Summit Opens",
          url: WORLD_ITEM_1_URL,
          source: "BBC",
          summary: "",
        },
        {
          title: "UN Security Council Meets",
          url: WORLD_ITEM_2_URL,
          source: "AP",
          summary: "",
        },
      ],
      generatedAt: "2026-04-28T08:00:00.000Z",
    },
  },
  // World item 1 summary chunks → "Global tensions rise."
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_1_URL, delta: "Global" } },
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_1_URL, delta: " tensions" } },
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_1_URL, delta: " rise." } },
  { event: "summary_done", data: { section: "world", url: WORLD_ITEM_1_URL } },
  // World item 2 summary chunks → "Security talks stall."
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_2_URL, delta: "Security" } },
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_2_URL, delta: " talks" } },
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_2_URL, delta: " stall." } },
  { event: "summary_done", data: { section: "world", url: WORLD_ITEM_2_URL } },
  // World diagnostics — emitted at end of section build
  {
    event: "section_diagnostics",
    data: {
      section: "world",
      cacheHit: false,
      llmModel: "claude-sonnet-4-6",
      selectionMethod: "llm",
      personalContextUsed: true,
      sources: [
        { source: "bbc", kind: "rss", status: "ok", articlesReturned: 5 },
        { source: "ap", kind: "rss", status: "ok", articlesReturned: 4 },
        { source: "reuters", kind: "rss", status: "failed", articlesReturned: 0, error: "timeout" },
      ],
      candidates: [
        {
          id: "c0",
          title: "Global Climate Summit Opens",
          source: "bbc",
          url: WORLD_ITEM_1_URL,
          picked: true,
        },
        {
          id: "c1",
          title: "UN Security Council Meets",
          source: "ap",
          url: WORLD_ITEM_2_URL,
          picked: true,
        },
        {
          id: "c2",
          title: "Other story",
          source: "bbc",
          url: "https://bbc.co.uk/other",
          picked: false,
        },
      ],
      scrapes: [
        {
          url: WORLD_ITEM_1_URL,
          title: "Global Climate Summit Opens",
          source: "bbc",
          outcome: "scraped",
          contentChars: 8421,
        },
        {
          url: WORLD_ITEM_2_URL,
          title: "UN Security Council Meets",
          source: "ap",
          outcome: "snippet-fallback",
          contentChars: 180,
        },
      ],
      durations: {
        fetchCandidatesMs: 820,
        selectionMs: 1400,
        scrapingMs: 2100,
        summarisationMs: 4900,
        totalMs: 9220,
      },
    },
  },

  // Tech section complete
  {
    event: "section_complete",
    data: {
      section: "tech",
      items: [
        {
          title: "AI Regulation Bill Advances",
          url: TECH_ITEM_1_URL,
          source: "TechCrunch",
          summary: "",
        },
        {
          title: "OpenAI Releases New Model",
          url: TECH_ITEM_2_URL,
          source: "OpenAI",
          summary: "",
        },
      ],
      generatedAt: "2026-04-28T08:00:01.000Z",
    },
  },
  // Tech item 1 summary chunks → "AI bill advances."
  { event: "summary_chunk", data: { section: "tech", url: TECH_ITEM_1_URL, delta: "AI" } },
  { event: "summary_chunk", data: { section: "tech", url: TECH_ITEM_1_URL, delta: " bill" } },
  { event: "summary_chunk", data: { section: "tech", url: TECH_ITEM_1_URL, delta: " advances." } },
  { event: "summary_done", data: { section: "tech", url: TECH_ITEM_1_URL } },
  // Tech item 2 summary chunks → "New model launched."
  { event: "summary_chunk", data: { section: "tech", url: TECH_ITEM_2_URL, delta: "New" } },
  { event: "summary_chunk", data: { section: "tech", url: TECH_ITEM_2_URL, delta: " model" } },
  { event: "summary_chunk", data: { section: "tech", url: TECH_ITEM_2_URL, delta: " launched." } },
  { event: "summary_done", data: { section: "tech", url: TECH_ITEM_2_URL } },

  // Longform section complete — mode: zoom-out
  {
    event: "section_complete",
    data: {
      section: "longform",
      mode: "zoom-out",
      items: [
        {
          title: "The Hidden Cost of Data Centers",
          url: LONGFORM_ITEM_URL,
          source: "The Atlantic",
          summary: "",
        },
      ],
      generatedAt: "2026-04-28T08:00:02.000Z",
    },
  },
  // Longform item summary chunks → "Data centers strain power grids."
  { event: "summary_chunk", data: { section: "longform", url: LONGFORM_ITEM_URL, delta: "Data" } },
  { event: "summary_chunk", data: { section: "longform", url: LONGFORM_ITEM_URL, delta: " centers" } },
  { event: "summary_chunk", data: { section: "longform", url: LONGFORM_ITEM_URL, delta: " strain" } },
  { event: "summary_chunk", data: { section: "longform", url: LONGFORM_ITEM_URL, delta: " power" } },
  { event: "summary_chunk", data: { section: "longform", url: LONGFORM_ITEM_URL, delta: " grids." } },
  { event: "summary_done", data: { section: "longform", url: LONGFORM_ITEM_URL } },

  { event: "done", data: {} },
];
