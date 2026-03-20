import React from "react";

export const Pill = ({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) => (
  <div className="inline-flex items-center gap-3 rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(10,12,25,0.9),rgba(7,9,20,0.92))] px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
    {icon && (
      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-white/6 bg-white/4 px-2">
        {icon}
      </span>
    )}
    <span className="font-sans text-[1.05rem] text-slate-300">{label}</span>
  </div>
);
