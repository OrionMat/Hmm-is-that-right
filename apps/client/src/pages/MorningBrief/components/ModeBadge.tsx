import { LongformMode } from "../../../dataModel/dataModel";

const MODE_LABEL: Record<LongformMode, string> = {
  "zoom-in": "Zoom In",
  "zoom-out": "Zoom Out",
  inversion: "Inversion",
};

const MODE_COLOUR: Record<LongformMode, string> = {
  "zoom-in": "bg-blue-100 text-blue-700",
  "zoom-out": "bg-purple-100 text-purple-700",
  inversion: "bg-amber-100 text-amber-700",
};

export const ModeBadge = ({ mode }: { mode: LongformMode }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${MODE_COLOUR[mode]}`}>
    {MODE_LABEL[mode]}
  </span>
);
