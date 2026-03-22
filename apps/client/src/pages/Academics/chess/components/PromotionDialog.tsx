import type { PlayerColor } from "../chessModel";

interface PromotionDialogProps {
  color: PlayerColor;
  onSelect: (piece: string) => void;
  onCancel: () => void;
}

const PIECES = [
  { symbol: "q", label: "Queen" },
  { symbol: "r", label: "Rook" },
  { symbol: "b", label: "Bishop" },
  { symbol: "n", label: "Knight" },
] as const;

// Unicode chess pieces: white = \u265x, black = \u266x
const PIECE_UNICODE: Record<string, Record<PlayerColor, string>> = {
  q: { w: "♕", b: "♛" },
  r: { w: "♖", b: "♜" },
  b: { w: "♗", b: "♝" },
  n: { w: "♘", b: "♞" },
};

export const PromotionDialog = ({ color, onSelect, onCancel }: PromotionDialogProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-light-grey p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Choose promotion piece"
        aria-modal="true"
      >
        <h2 className="text-base font-semibold text-gray-800">Promote pawn to:</h2>
        <div className="flex gap-3">
          {PIECES.map(({ symbol, label }) => (
            <button
              key={symbol}
              onClick={() => onSelect(symbol)}
              className="flex flex-col items-center gap-1 w-16 h-20 rounded-lg border-2 border-light-grey hover:border-link hover:bg-blue-50 transition-all"
              aria-label={label}
            >
              <span className="text-4xl mt-2">{PIECE_UNICODE[symbol][color]}</span>
              <span className="text-xs text-very-dark-grey">{label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-very-dark-grey hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
