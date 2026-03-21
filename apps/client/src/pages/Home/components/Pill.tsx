import { PillData } from "../../../dataModel/dataModel";

export const Pill = ({ label, icon: Icon }: PillData) => (
  <div className="pill">
    {Icon && (
      <span className="pill-icon">
        <Icon />
      </span>
    )}
    <span className="font-sans text-[1.05rem] text-surface-muted">{label}</span>
  </div>
);
