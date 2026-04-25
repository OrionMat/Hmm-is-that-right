import { BriefItem as BriefItemType, LongformMode, MorningBriefSection } from "../../../dataModel/dataModel";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { BriefItem } from "./BriefItem";
import { ModeBadge } from "./ModeBadge";

export type SectionStatus = "idle" | "loading" | "complete" | "error";

const SECTION_TITLE: Record<MorningBriefSection, string> = {
  world: "World Headlines",
  tech: "Tech & AI",
  longform: "Long-Form Insight",
};

interface BriefSectionProps {
  section: MorningBriefSection;
  status: SectionStatus;
  items?: BriefItemType[];
  mode?: LongformMode;
  error?: string;
}

export const BriefSection = ({ section, status, items = [], mode, error }: BriefSectionProps) => (
  <div className="w-full max-w-2xl border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <h2 className="font-mono font-bold text-base">{SECTION_TITLE[section]}</h2>
      {mode && <ModeBadge mode={mode} />}
      {status === "loading" && <LoadingSpinner className="w-4 h-4 border-[1.5px] ml-auto" />}
    </div>

    {status === "error" && (
      <p className="font-mono text-sm text-red-500">{error ?? "Failed to load this section."}</p>
    )}

    {status === "complete" && items.length === 0 && (
      <p className="font-mono text-sm text-gray-400">No content found for this section today.</p>
    )}

    {status === "complete" && items.length > 0 && (
      <div className="flex flex-col">
        {items.map((item, i) => (
          <BriefItem key={i} item={item} />
        ))}
      </div>
    )}
  </div>
);
