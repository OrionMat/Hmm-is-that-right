import { BriefItem as BriefItemType } from "../../../dataModel/dataModel";

export const BriefItem = ({ item }: { item: BriefItemType }) => (
  <div className="flex flex-col gap-2 py-4 border-b border-gray-100 last:border-0">
    <div className="flex items-start justify-between gap-4">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono font-semibold text-sm text-blue-600 hover:underline leading-snug"
      >
        {item.title}
      </a>
      <span className="font-mono text-xs text-gray-400 whitespace-nowrap shrink-0">{item.source}</span>
    </div>
    {item.summary && (
      <p className="font-mono text-sm text-gray-700 leading-relaxed">{item.summary}</p>
    )}
  </div>
);
