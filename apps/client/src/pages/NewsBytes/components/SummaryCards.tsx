import { HeadlineSummary } from "../../../dataModel/dataModel";
import { SelectNewsIcon } from "../../../icons/NewsIcons";

interface SummaryCardsProps {
  summaries: HeadlineSummary[];
}

export const SummaryCards = ({ summaries }: SummaryCardsProps) => {
  return (
    <div className="w-3/4 mt-6 flex flex-col gap-4">
      {summaries.map((summary) => (
        <div
          key={summary.url}
          className="rounded-lg shadow-[0_1px_6px_-1px_var(--color-dark-grey)] p-5 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <SelectNewsIcon source={summary.source} isActive={true} />
            </div>
            <a
              href={summary.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline"
            >
              {summary.title}
            </a>
          </div>
          {summary.date && (
            <p className="text-sm text-very-dark-grey/60 font-mono">{summary.date}</p>
          )}
          {summary.summary.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 font-mono text-sm">
              {summary.summary.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-very-dark-grey/60 italic font-mono">
              Summary unavailable
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
