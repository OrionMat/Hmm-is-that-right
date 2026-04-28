import type { SseEvent } from "./happyPath";

const WORLD_ITEM_1_URL = "https://reuters.com/world-trade-talks";
const WORLD_ITEM_2_URL = "https://bbc.co.uk/middle-east-update";
const LONGFORM_ITEM_URL = "https://newyorker.com/democracy-piece";

export const SECTION_ERROR_SSE_EVENTS: SseEvent[] = [
  // Section starts
  { event: "section_start", data: { section: "world" } },
  { event: "section_start", data: { section: "tech" } },
  { event: "section_start", data: { section: "longform" } },

  // World succeeds with 2 items
  {
    event: "section_complete",
    data: {
      section: "world",
      items: [
        {
          title: "World Trade Talks Resume",
          url: WORLD_ITEM_1_URL,
          source: "Reuters",
          summary: "",
        },
        {
          title: "Middle East Update",
          url: WORLD_ITEM_2_URL,
          source: "BBC",
          summary: "",
        },
      ],
      generatedAt: "2026-04-28T08:00:00.000Z",
    },
  },
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_1_URL, delta: "Trade" } },
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_1_URL, delta: " talks" } },
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_1_URL, delta: " resume." } },
  { event: "summary_done", data: { section: "world", url: WORLD_ITEM_1_URL } },
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_2_URL, delta: "Ceasefire" } },
  { event: "summary_chunk", data: { section: "world", url: WORLD_ITEM_2_URL, delta: " holds." } },
  { event: "summary_done", data: { section: "world", url: WORLD_ITEM_2_URL } },

  // Tech fails
  { event: "section_error", data: { section: "tech", message: "HN API timeout" } },

  // Longform succeeds with 1 item (mode: zoom-in)
  {
    event: "section_complete",
    data: {
      section: "longform",
      mode: "zoom-in",
      items: [
        {
          title: "The Quiet Crisis in Democracy",
          url: LONGFORM_ITEM_URL,
          source: "The New Yorker",
          summary: "",
        },
      ],
      generatedAt: "2026-04-28T08:00:02.000Z",
    },
  },
  { event: "summary_chunk", data: { section: "longform", url: LONGFORM_ITEM_URL, delta: "Democratic" } },
  { event: "summary_chunk", data: { section: "longform", url: LONGFORM_ITEM_URL, delta: " norms" } },
  { event: "summary_chunk", data: { section: "longform", url: LONGFORM_ITEM_URL, delta: " erode." } },
  { event: "summary_done", data: { section: "longform", url: LONGFORM_ITEM_URL } },

  { event: "done", data: {} },
];
