import { useEffect, useRef, useState } from "react";
import {
  BriefItem,
  LongformMode,
  MorningBriefSection,
  SectionDiagnostics,
  PaperOfYear as PaperOfYearType,
  SectionPayload,
} from "../../dataModel/dataModel";
import { subscribeMorningBrief } from "../../service/morningBriefStream";
import { fetchPaperOfYear } from "../../service/paperOfYearService";
import { PageContainer } from "../../components/PageContainer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { BriefSection, SectionStatus } from "./components/BriefSection";
import { BehindTheScenes } from "./components/BehindTheScenes";
import { FeedbackForm } from "./components/FeedbackForm";
import { PaperOfYear as PaperOfYearComponent } from "./components/PaperOfYear";

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
};

export const MorningBrief = () => {
  const [sections, setSections] = useState<SectionsState>(INITIAL_STATE);
  const [running, setRunning] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const disposeRef = useRef<(() => void) | null>(null);
  const [paper, setPaper] = useState<PaperOfYearType | null>(null);
  const [paperLoading, setPaperLoading] = useState(false);
  const [paperError, setPaperError] = useState<string | null>(null);

  const patchSection = (section: MorningBriefSection, patch: Partial<SectionState>) =>
    setSections((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));

  const handleStart = () => {
    // Close any existing stream
    disposeRef.current?.();

    setConnectionError(false);
    setSections({
      world: { status: "loading" },
      tech: { status: "loading" },
      longform: { status: "loading" },
    });
    setRunning(true);

    const dispose = subscribeMorningBrief({
      onSectionStart: (section, mode) => patchSection(section, { status: "loading", mode }),
      onSectionComplete: (payload: SectionPayload) =>
        patchSection(payload.section, { status: "complete", items: payload.items, mode: payload.mode }),
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
    });

    disposeRef.current = dispose;

    setPaperError(null);
    setPaperLoading(true);
    fetchPaperOfYear()
      .then((fetched) => setPaper(fetched))
      .catch((err: Error) => setPaperError(err.message))
      .finally(() => setPaperLoading(false));
  };

  // Cleanup on unmount
  useEffect(() => () => disposeRef.current?.(), []);

  const allIdle = Object.values(sections).every((s) => s.status === "idle");
  const anyDiagnostics = Object.values(sections).some((s) => s.diagnostics);

  return (
    <PageContainer id="morning-brief-content">
      <div className="flex flex-col items-center w-full gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-mono font-bold text-2xl">Morning Brief</h1>
          <p className="font-mono text-sm text-gray-500 max-w-sm">
            A personalised daily intelligence brief — world headlines, tech stories, and one deep insight.
          </p>
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
            {(["world", "tech", "longform"] as MorningBriefSection[]).map((section) => (
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
            diagnosticsBySection={{
              world: sections.world.diagnostics,
              tech: sections.tech.diagnostics,
              longform: sections.longform.diagnostics,
            }}
          />
        )}

        <FeedbackForm />

        {paperLoading && (
          <div className="w-full max-w-2xl flex items-center gap-2 p-6 border border-gray-200 rounded-lg">
            <LoadingSpinner className="w-4 h-4 border-[1.5px]" />
            <span className="font-mono text-sm text-gray-500">Loading paper…</span>
          </div>
        )}
        {paperError && (
          <p className="font-mono text-sm text-red-500">Paper of the Week unavailable: {paperError}</p>
        )}
        {paper && !paperLoading && (
          <PaperOfYearComponent key={paper.arxivId} paper={paper} />
        )}
      </div>
    </PageContainer>
  );
};
