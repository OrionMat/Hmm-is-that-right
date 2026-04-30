import {
  CandidateMeta,
  MorningBriefSection,
  ScrapeAttempt,
  ScrapeOutcome,
  SectionDiagnostics,
  SELECTION_METHOD,
  SourceQueryResult,
  SourceStatus,
} from "../../../dataModel/dataModel";
import { SECTION_TITLE } from "../sectionTitles";

const SOURCE_GLYPH: Record<SourceStatus, string> = {
  ok: "✓",
  empty: "∅",
  failed: "✗",
};

const SOURCE_GLYPH_CLASS: Record<SourceStatus, string> = {
  ok: "text-green-600",
  empty: "text-gray-400",
  failed: "text-red-500",
};

const SCRAPE_GLYPH: Record<ScrapeOutcome, string> = {
  scraped: "✓",
  prefetched: "✓",
  "snippet-fallback": "✗",
};

const SCRAPE_GLYPH_CLASS: Record<ScrapeOutcome, string> = {
  scraped: "text-green-600",
  prefetched: "text-green-600",
  "snippet-fallback": "text-red-500",
};

const SCRAPE_LABEL: Record<ScrapeOutcome, string> = {
  scraped: "scraped",
  prefetched: "pre-fetched",
  "snippet-fallback": "snippet fallback",
};

interface BehindTheScenesProps {
  diagnosticsBySection: Partial<Record<MorningBriefSection, SectionDiagnostics | undefined>>;
}

const ORDERED_SECTIONS: MorningBriefSection[] = ["world", "tech", "longform"];

export const BehindTheScenes = ({ diagnosticsBySection }: BehindTheScenesProps) => {
  const sectionsWithData = ORDERED_SECTIONS.filter((s) => diagnosticsBySection[s]);
  if (sectionsWithData.length === 0) return null;

  return (
    <details
      className="w-full max-w-2xl border border-gray-200 rounded-lg p-4 font-mono text-sm"
      data-testid="behind-the-scenes"
    >
      <summary className="cursor-pointer font-bold text-base">Behind the scenes</summary>
      <p className="text-xs text-gray-500 mt-2 mb-4">
        How each section was built — sources checked, headlines considered, and what made the cut.
      </p>
      <div className="flex flex-col gap-4">
        {sectionsWithData.map((section) => (
          <SectionDiagnosticsBlock
            key={section}
            section={section}
            diagnostics={diagnosticsBySection[section] as SectionDiagnostics}
          />
        ))}
      </div>
    </details>
  );
};

const SectionDiagnosticsBlock = ({
  section,
  diagnostics,
}: {
  section: MorningBriefSection;
  diagnostics: SectionDiagnostics;
}) => {
  const title = SECTION_TITLE[section];
  const modeLabel = diagnostics.mode ? ` (${diagnostics.mode})` : "";

  return (
    <details className="border border-gray-100 rounded p-3" open>
      <summary className="cursor-pointer font-bold">
        {title}
        {modeLabel}
        {diagnostics.cacheHit && (
          <span className="ml-2 text-xs font-normal text-gray-500">[cached]</span>
        )}
      </summary>
      <div className="flex flex-col gap-3 mt-3">
        <SourcesRow sources={diagnostics.sources} />
        <CandidatesRow candidates={diagnostics.candidates} />
        <ScrapesRow scrapes={diagnostics.scrapes} />
        <MetaRow diagnostics={diagnostics} />
      </div>
    </details>
  );
};

const SourcesRow = ({ sources }: { sources: SourceQueryResult[] }) => (
  <Row label="Sources checked">
    {sources.length === 0 ? (
      <span className="text-gray-400">none</span>
    ) : (
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {sources.map((s) => (
          <li key={s.source} className="flex items-center gap-1.5">
            <span className={SOURCE_GLYPH_CLASS[s.status]} aria-label={s.status}>
              {SOURCE_GLYPH[s.status]}
            </span>
            <span>{s.source}</span>
            <span className="text-xs text-gray-500">({s.articlesReturned})</span>
            {s.error && (
              <span className="text-xs text-red-500" title={s.error}>
                {" "}— {s.error}
              </span>
            )}
          </li>
        ))}
      </ul>
    )}
  </Row>
);

const CandidatesRow = ({ candidates }: { candidates: CandidateMeta[] }) => (
  <Row
    label={`Headlines considered (${candidates.length}; ${candidates.filter((c) => c.picked).length} picked)`}
  >
    {candidates.length === 0 ? (
      <span className="text-gray-400">none</span>
    ) : (
      <ol className="flex flex-col gap-1 list-decimal list-inside">
        {candidates.map((c) => (
          <li
            key={c.id}
            className={c.picked ? "font-semibold" : "text-gray-600"}
            data-picked={c.picked}
          >
            <a href={c.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
              {c.title}
            </a>
            <span className="text-xs text-gray-500"> [{c.source}]</span>
            {typeof c.score === "number" && (
              <span className="text-xs text-gray-400"> · score {c.score}</span>
            )}
            {c.picked && <span className="text-xs text-green-600"> · picked</span>}
          </li>
        ))}
      </ol>
    )}
  </Row>
);

const ScrapesRow = ({ scrapes }: { scrapes: ScrapeAttempt[] }) => (
  <Row label="Scrape outcomes">
    {scrapes.length === 0 ? (
      <span className="text-gray-400">no articles to scrape</span>
    ) : (
      <ul className="flex flex-col gap-1">
        {scrapes.map((s) => (
          <li key={s.url} className="flex items-baseline gap-2">
            <span className={SCRAPE_GLYPH_CLASS[s.outcome]} aria-label={s.outcome}>
              {SCRAPE_GLYPH[s.outcome]}
            </span>
            <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline">
              {s.title}
            </a>
            <span className="text-xs text-gray-500">
              [{s.source}] · {SCRAPE_LABEL[s.outcome]}
              {typeof s.contentChars === "number" && ` · ${s.contentChars.toLocaleString()} chars`}
            </span>
          </li>
        ))}
      </ul>
    )}
  </Row>
);

const MetaRow = ({ diagnostics }: { diagnostics: SectionDiagnostics }) => {
  const d = diagnostics.durations;
  const selectionLabel =
    diagnostics.selectionMethod === SELECTION_METHOD.scoreFallback
      ? "score fallback (LLM unavailable)"
      : diagnostics.selectionMethod === SELECTION_METHOD.none
        ? "none (no candidates)"
        : `LLM (${diagnostics.llmModel})`;

  return (
    <Row label="Pipeline">
      <ul className="flex flex-col gap-0.5 text-xs text-gray-600">
        <li>Selection: {selectionLabel}</li>
        <li>Personal context: {diagnostics.personalContextUsed ? "applied" : "not configured"}</li>
        {diagnostics.cacheHit ? (
          <li>Served from cache ({fmtMs(d.totalMs)})</li>
        ) : (
          <li>
            Timings: fetch {fmtMs(d.fetchCandidatesMs)} · select {fmtMs(d.selectionMs)} · scrape{" "}
            {fmtMs(d.scrapingMs)} · summarise {fmtMs(d.summarisationMs)}
            <span className="text-gray-400"> · total {fmtMs(d.totalMs)}</span>
          </li>
        )}
        <li>Cache: {diagnostics.cacheHit ? "hit (re-served from cache)" : "miss (freshly built)"}</li>
      </ul>
    </Row>
  );
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div>{children}</div>
  </div>
);

function fmtMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
