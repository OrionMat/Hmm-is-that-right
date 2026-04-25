import { useEffect, useRef, useState } from "react";
import { BriefItem, LongformMode, MorningBriefSection, SectionPayload } from "../../dataModel/dataModel";
import { subscribeMorningBrief } from "../../service/morningBriefStream";
import { PageContainer } from "../../components/PageContainer";
import { BriefSection, SectionStatus } from "./components/BriefSection";

interface SectionState {
  status: SectionStatus;
  items?: BriefItem[];
  mode?: LongformMode;
  error?: string;
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
      onDone: () => setRunning(false),
      onConnectionError: () => {
        setRunning(false);
        setConnectionError(true);
      },
    });

    disposeRef.current = dispose;
  };

  // Cleanup on unmount
  useEffect(() => () => disposeRef.current?.(), []);

  const allIdle = Object.values(sections).every((s) => s.status === "idle");

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
      </div>
    </PageContainer>
  );
};
