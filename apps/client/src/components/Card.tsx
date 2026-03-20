import React from "react";
import { CardKind, kindClasses, kindSymbols } from "../dataModel/dataModel";

/**
 * Generic Card Data structure
 */
export interface CardData {
  name: string;
  handle: string;
  description: string;
  kinds: CardKind[];
  score: number;
  badge: string;
  accent?: string; // specific styling like background gradients
}

export const Card = ({ card }: { card: CardData }) => (
  <article className="group relative overflow-hidden rounded-[30px] border border-violet-300/28 bg-[linear-gradient(180deg,rgba(8,7,18,0.98),rgba(19,16,33,0.94))] p-6 shadow-[0_0_0_1px_rgba(124,103,214,0.04),0_18px_48px_rgba(6,4,15,0.58)] transition duration-300 hover:-translate-y-1 hover:border-violet-300/40 hover:shadow-[0_0_0_1px_rgba(136,116,220,0.07),0_24px_70px_rgba(13,9,28,0.72)] lg:p-8">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(121,106,198,0.1),_transparent_56%)] opacity-90" />

    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t ${card.accent || "from-violet-500/10 via-transparent to-transparent"} opacity-90 transition duration-300 group-hover:opacity-100`}
    />

    {/* Header Section: Title, Handle, and Badge */}
    <div className="relative z-10 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <h3 className="truncate font-sans text-[1.65rem] leading-none font-semibold tracking-[-0.045em] text-white lg:text-[1.85rem]">
          {card.name}
        </h3>
        <p className="mt-1.5 truncate font-sans text-[0.95rem] leading-tight text-slate-100 lg:text-[1rem]">
          {card.handle}
        </p>
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-300/25 bg-[linear-gradient(180deg,rgba(28,20,58,0.96),rgba(13,10,24,0.96))] font-mono text-xs font-semibold text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] lg:h-14 lg:w-14 lg:text-sm">
        {card.badge}
      </div>
    </div>

    {/* Description Section */}
    <p className="relative z-10 mt-6 min-h-20 font-sans text-[0.95rem] leading-7 text-slate-100 lg:text-[1rem] lg:leading-7">
      {card.description}
    </p>

    {/* Footer Section: Kind Tags and Score */}
    <div className="relative z-10 mt-7 flex items-end justify-between gap-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {card.kinds.map((kind) => (
          <span
            key={`${card.name}-${kind}`}
            className={`inline-flex items-center gap-2 font-mono text-sm ${kindClasses[kind]}`}
          >
            <span className="text-xs">{kindSymbols[kind]}</span>
            {kind}
          </span>
        ))}
      </div>

      <div className="inline-flex items-center gap-2 rounded-xl border border-stone-300/45 bg-stone-400/12 px-4 py-2 font-mono text-sm text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <span>*</span>
        {card.score.toLocaleString()}
      </div>
    </div>
  </article>
);
