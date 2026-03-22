import { CardData, kindClasses, kindSymbols } from "../../../dataModel/dataModel";

export const Card = ({ card }: { card: CardData }) => (
  <article className="card group lg:p-8">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(121,106,198,0.1),_transparent_56%)] opacity-90" />

    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t ${card.accent || "from-violet-500/10 via-transparent to-transparent"} opacity-90 transition duration-300 group-hover:opacity-100`}
    />

    {/* Header Section: Title, Handle, and Badge */}
    <div className="relative z-10 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <h3 className="truncate font-sans text-[1.65rem] leading-none font-semibold tracking-[-0.045em] text-surface-heading lg:text-[1.85rem]">
          {card.name}
        </h3>
        <p className="mt-1.5 truncate font-sans text-[0.95rem] leading-tight text-surface-body lg:text-[1rem]">
          {card.handle}
        </p>
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-300/25 bg-[linear-gradient(180deg,rgba(28,20,58,0.96),rgba(13,10,24,0.96))] text-xs font-semibold text-surface-badge shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:h-14 lg:w-14 lg:text-sm">
        {card.badge}
      </div>
    </div>

    {/* Description Section */}
    <p className="relative z-10 mt-6 min-h-20 font-sans text-[0.95rem] leading-7 text-surface-body lg:text-[1rem] lg:leading-7">
      {card.description}
    </p>

    {/* Footer Section: Kind Tags and Score */}
    <div className="relative z-10 mt-7 flex items-end justify-between gap-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {card.kinds.map((kind) => (
          <span
            key={`${card.name}-${kind}`}
            className={`inline-flex items-center gap-2 text-sm ${kindClasses[kind]}`}
          >
            <span className="text-xs">{kindSymbols[kind]}</span>
            {kind}
          </span>
        ))}
      </div>

      <div className="inline-flex items-center gap-2 rounded-xl border border-stone-300/45 bg-stone-400/12 px-4 py-2 text-sm text-surface-score shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <span>★</span>
        {card.score.toLocaleString()}
      </div>
    </div>
  </article>
);
