import type { ComponentType } from "react";

// Shared types (NewsPiece, RelevantNewsPiece) live in apps/shared/dataModel.ts
// to avoid duplication with the server. Import them from there via this re-export.
export type { NewsPiece, RelevantNewsPiece } from "../../../shared/dataModel";

export type CardKind = "MCP" | "Skills" | "Commands" | "Context";

export const kindClasses: Record<CardKind, string> = {
  MCP: "text-kind-mcp",
  Skills: "text-kind-skills",
  Commands: "text-kind-commands",
  Context: "text-kind-context",
} as const;

export const kindSymbols: Record<CardKind, string> = {
  MCP: "[]",
  Skills: "*",
  Commands: ">_",
  Context: "()",
} as const;

export interface NewsSource {
  source: string;
  url: string;
  isActive: boolean;
}

export interface PermanentNewsSources {
  bbc: string;
  nyt: string;
  ap: string;
  reuters: string;
  twitter: string;
}

export const permanentSources: Readonly<PermanentNewsSources> = {
  bbc: "bbc",
  nyt: "nyt",
  ap: "ap",
  reuters: "reuters",
  twitter: "twitter",
};

export const permanentSourceUrls: Readonly<PermanentNewsSources> = {
  bbc: "https://www.bbc.co.uk",
  nyt: "https://www.nyt.com",
  ap: "https://www.ap.com",
  reuters: "https://www.reuters.sa",
  twitter: "https://www.twitter.com",
};

export interface IsActiveNewsSources {
  bbc: boolean;
  nyt: boolean;
  ap: boolean;
  reuters: boolean;
  twitter: boolean;
}

export interface CardData {
  name: string;
  handle: string;
  description: string;
  kinds: CardKind[];
  score: number;
  badge: string;
  accent?: string;
}

export interface PillData {
  label: string;
  icon?: ComponentType;
}
