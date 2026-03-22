import type { GameStatus, PlayerColor } from "../chessModel";

interface ChessControlsProps {
  status: GameStatus;
  turn: PlayerColor;
  isCheck: boolean;
  winner: PlayerColor | null;
  boardOrientation: PlayerColor;
  onReset: () => void;
  onResign: () => void;
  onFlipBoard: () => void;
}

const STATUS_LABELS: Record<GameStatus, string> = {
  active: "",
  checkmate: "Checkmate",
  stalemate: "Stalemate — Draw",
  draw: "Draw",
  resigned: "Resigned",
};

const PLAYER_LABEL: Record<PlayerColor, string> = { w: "White", b: "Black" };

export const ChessControls = ({
  status,
  turn,
  isCheck,
  winner,
  boardOrientation,
  onReset,
  onResign,
  onFlipBoard,
}: ChessControlsProps) => {
  const statusLabel = (() => {
    if (status !== "active") return STATUS_LABELS[status];
    if (isCheck) return `${PLAYER_LABEL[turn]}'s turn — Check!`;
    return `${PLAYER_LABEL[turn]}'s turn`;
  })();

  const isCheckStatus = status === "active" && isCheck;

  return (
    <div className="flex items-center justify-between w-full max-w-[560px] mx-auto mb-4">
      <span
        className={`text-sm font-semibold ${
          isCheckStatus ? "text-danger-red" : "text-very-dark-grey"
        }`}
      >
        {statusLabel}
        {winner && ` — ${PLAYER_LABEL[winner]} wins`}
      </span>

      <div className="flex gap-2">
        <button
          onClick={onFlipBoard}
          className="px-3 py-1.5 rounded-lg border border-light-grey text-very-dark-grey text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Flip Board
        </button>
        {status === "active" && (
          <button
            onClick={onResign}
            className="px-3 py-1.5 rounded-lg border border-light-grey text-very-dark-grey text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Resign
          </button>
        )}
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg bg-link text-white text-sm font-medium hover:opacity-80 transition-opacity"
        >
          New Game
        </button>
      </div>
    </div>
  );
};
