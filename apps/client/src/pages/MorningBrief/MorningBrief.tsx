import { useEffect, useRef, useState } from "react";
import {
  BriefItem,
  LongformMode,
  MORNING_BRIEF_SECTION,
  MorningBriefSection,
  SectionDiagnostics,
  SectionPayload,
} from "../../dataModel/dataModel";
import { subscribeMorningBrief } from "../../service/morningBriefStream";
import { PageContainer } from "../../components/PageContainer";
import { SearchBar } from "../../components/SearchBar";
import { Tile } from "../../components/Tile";
import { BriefSection, SectionStatus } from "./components/BriefSection";
import { BehindTheScenes } from "./components/BehindTheScenes";
import { FeedbackForm } from "./components/FeedbackForm";

interface SectionState {
  status: SectionStatus;
  items?: BriefItem[];
  mode?: LongformMode;
  error?: string;
  diagnostics?: SectionDiagnostics;
}

type SectionsState = Record<MorningBriefSection, SectionState>;

const INITIAL_STATE: SectionsState = {
  world: { status: "idle" },
  tech: { status: "idle" },
  longform: { status: "idle" },
  search: { status: "idle" },
};

const TOGGLE_SOURCES = ["bbc", "nyt", "ap"] as const;
type ToggleSource = (typeof TOGGLE_SOURCES)[number];

const INITIAL_SOURCE_STATES: Record<ToggleSource, boolean> = {
  bbc: true,
  nyt: true,
  ap: true,
};

const DEFAULT_SECTIONS: MorningBriefSection[] = [
  MORNING_BRIEF_SECTION.world,
  MORNING_BRIEF_SECTION.tech,
  MORNING_BRIEF_SECTION.longform,
];

export const MorningBrief = () => {
  const [sections, setSections] = useState<SectionsState>(INITIAL_STATE);
  const [running, setRunning] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [query, setQuery] = useState("");
  const [sourceStates, setSourceStates] = useState(INITIAL_SOURCE_STATES);
  // Whether the *currently displayed* brief was a search-mode run; we hold it in
  // state (rather than reading `query`) so the user can edit the input without
  // the rendered sections shifting underneath them.
  const [activeMode, setActiveMode] = useState<"default" | "search">("default");
  const disposeRef = useRef<(() => void) | null>(null);

  const patchSection = (section: MorningBriefSection, patch: Partial<SectionState>) =>
    setSections((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));

  const toggleSource = (source: ToggleSource, isActive: boolean) =>
    setSourceStates((prev) => ({ ...prev, [source]: isActive }));

  const handleStart = () => {
    // Close any existing stream
    disposeRef.current?.();

    const trimmedQuery = query.trim();
    const isSearchMode = trimmedQuery.length > 0;
    const enabledSources = TOGGLE_SOURCES.filter((s) => sourceStates[s]);

    setConnectionError(false);
    setActiveMode(isSearchMode ? "search" : "default");
    setSections(
      isSearchMode
        ? { ...INITIAL_STATE, search: { status: "loading" } }
        : {
            ...INITIAL_STATE,
            world: { status: "loading" },
            tech: { status: "loading" },
            longform: { status: "loading" },
          },
    );
    setRunning(true);

    const dispose = subscribeMorningBrief(
      {
        onSectionStart: (section, mode) => patchSection(section, { status: "loading", mode }),
        onSectionComplete: (payload: SectionPayload) =>
          patchSection(payload.section, {
            status: "complete",
            items: payload.items,
            mode: payload.mode,
          }),
        onSectionError: (section, message) =>
          patchSection(section, { status: "error", error: message }),
        onSummaryChunk: ({ section, url, delta }) =>
          setSections((prev) => {
            const current = prev[section];
            if (!current.items) return prev;
            return {
              ...prev,
              [section]: {
                ...current,
                items: current.items.map((item) =>
                  item.url === url ? { ...item, summary: item.summary + delta } : item,
                ),
              },
            };
          }),
        onSectionDiagnostics: (diagnostics) =>
          patchSection(diagnostics.section, { diagnostics }),
        onDone: () => setRunning(false),
        onConnectionError: () => {
          setRunning(false);
          setConnectionError(true);
        },
      },
      { query: trimmedQuery || undefined, sources: enabledSources },
    );

    disposeRef.current = dispose;
  };

  // Cleanup on unmount
  useEffect(() => () => disposeRef.current?.(), []);

  const visibleSections: MorningBriefSection[] =
    activeMode === "search" ? [MORNING_BRIEF_SECTION.search] : DEFAULT_SECTIONS;
  const allIdle = visibleSections.every((s) => sections[s].status === "idle");
  const anyDiagnostics = visibleSections.some((s) => sections[s].diagnostics);

  return (
    <PageContainer id="morning-brief-content">
      <div className="flex flex-col items-center w-full gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-mono font-bold text-2xl">Morning Brief</h1>
          <p className="font-mono text-sm text-gray-500 max-w-sm">
            A personalised daily intelligence brief — world headlines, tech stories, and one deep insight.
            Add a search to dive into something specific.
          </p>
        </div>

        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleStart}
          placeholder="Search a topic, fact, or statement (optional)"
          isLoading={running}
          disabled={running}
        />

        <div className="flex gap-4">
          {TOGGLE_SOURCES.map((source) => (
            <Tile
              key={source}
              source={source}
              isActive={sourceStates[source]}
              handleClick={(isActive) => toggleSource(source, isActive)}
              disabled={running}
            />
          ))}
        </div>

        <button
          className="h-[40px] px-8 border border-light-grey rounded-full font-mono text-sm bg-transparent cursor-pointer transition-[box-shadow,border-color] duration-200 hover:shadow-[0_1px_6px_var(--color-dark-grey)] hover:border-transparent focus:outline-none focus:shadow-[0_1px_6px_var(--color-dark-grey)] focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleStart}
          disabled={running}
        >
          {running ? "Generating…" : "Get My Brief"}
        </button>

        {connectionError && (
          <p className="font-mono text-sm text-red-500">
            Connection lost. Please try again.
          </p>
        )}

        {!allIdle && (
          <div className="flex flex-col items-center gap-4 w-full">
            {visibleSections.map((section) => (
              <BriefSection
                key={section}
                section={section}
                status={sections[section].status}
                items={sections[section].items}
                mode={sections[section].mode}
                error={sections[section].error}
              />
            ))}
          </div>
        )}

        {anyDiagnostics && (
          <BehindTheScenes
            diagnosticsBySection={Object.fromEntries(
              visibleSections.map((s) => [s, sections[s].diagnostics]),
            )}
          />
        )}

        <FeedbackForm />
      </div>
    </PageContainer>
  );
};
