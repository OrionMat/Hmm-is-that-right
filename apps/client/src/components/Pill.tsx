import { PillData } from "../dataModel/dataModel";

export const Pill = ({ label, icon: Icon }: PillData) => (
  <div className="inline-flex items-center gap-3 rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(10,12,25,0.9),rgba(7,9,20,0.92))] px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
    {Icon && (
      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-white/6 bg-white/4 px-2">
        <Icon />
      </span>
    )}
    <span className="font-sans text-[1.05rem] text-surface-muted">{label}</span>
  </div>
);
