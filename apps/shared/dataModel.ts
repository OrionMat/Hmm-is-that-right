/**
 * Shared data model types used by both client and server.
 *
 * DO NOT add client-only types (React imports, UI models) or server-only types
 * (SourceUrls, SourcePages) here. Those live in their respective dataModel.ts files.
 */

/**
 * A scraped news article.
 * i.e { url: "www.bbc...", title: "Tea Pots", date: "01/01/2020", body: ["list", "of", "paragraphs"], source: "bbc" }
 */
export interface NewsPiece {
  url: string;
  title: string | null | undefined;
  date: string | null | undefined;
  body: Array<string | null | undefined>;
  source: string;
}

/**
 * A news piece enriched with the most relevant sentence/paragraph for a given statement.
 *
 * TODO: Stance detection using RelevantNewsPiece is not yet wired into any route.
 * It is planned for a future endpoint that compares article content against a user's
 * statement. See openAIService.ts for the integration that will power this.
 */
export interface RelevantNewsPiece {
  url: string;
  title: string | null | undefined;
  date: string | null | undefined;
  source: string;
  mostSimilarSentence: string;
  mostSimilarParagraph: string;
}
