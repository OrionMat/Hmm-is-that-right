import type { SseEvent } from "./happyPath";

export const CACHE_HIT_SSE_EVENTS: SseEvent[] = [
  { event: "section_start", data: { section: "world" } },
  { event: "section_start", data: { section: "tech" } },
  { event: "section_start", data: { section: "longform" } },

  // Summaries already filled — no summary_chunk events follow
  {
    event: "section_complete",
    data: {
      section: "world",
      items: [
        {
          title: "Global Climate Summit Opens",
          url: "https://bbc.co.uk/climate-summit",
          source: "BBC",
          summary: "World leaders gather to negotiate binding emissions targets.",
        },
        {
          title: "UN Security Council Meets",
          url: "https://apnews.com/un-security-council",
          source: "AP",
          summary: "Emergency session called over escalating regional conflict.",
        },
      ],
      generatedAt: "2026-04-28T07:00:00.000Z",
    },
  },
  {
    event: "section_complete",
    data: {
      section: "tech",
      items: [
        {
          title: "AI Regulation Bill Advances",
          url: "https://techcrunch.com/ai-regulation-bill",
          source: "TechCrunch",
          summary: "Senate committee approves landmark AI governance framework.",
        },
        {
          title: "OpenAI Releases New Model",
          url: "https://openai.com/new-model",
          source: "OpenAI",
          summary: "Flagship model claims top benchmark scores across reasoning tasks.",
        },
      ],
      generatedAt: "2026-04-28T07:00:01.000Z",
    },
  },
  {
    event: "section_complete",
    data: {
      section: "longform",
      mode: "zoom-out",
      items: [
        {
          title: "The Hidden Cost of Data Centers",
          url: "https://theatlantic.com/data-centers",
          source: "The Atlantic",
          summary: "Data centers strain power grids as AI compute demand surges.",
        },
      ],
      generatedAt: "2026-04-28T07:00:02.000Z",
    },
  },

  { event: "done", data: {} },
];
