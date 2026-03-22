import type { GameStatus, PlayerColor } from "../chessModel";

interface GameOverBannerProps {
  status: GameStatus;
  winner: PlayerColor | null;
  onReset: () => void;
}

const PLAYER_LABEL: Record<PlayerColor, string> = { w: "White", b: "Black" };

const OUTCOME_TITLE: Record<GameStatus, string> = {
  active: "",
  checkmate: "Checkmate!",
  stalemate: "Stalemate",
  draw: "Draw",
  resigned: "Game Over",
};

function getOutcomeDescription(status: GameStatus, winner: PlayerColor | null): string {
  if (status === "checkmate" && winner) return `${PLAYER_LABEL[winner]} wins`;
  if (status === "stalemate") return "No legal moves — the game is a draw";
  if (status === "draw") return "The game ended in a draw";
  if (status === "resigned" && winner) return `${PLAYER_LABEL[winner]} wins by resignation`;
  return "";
}

export const GameOverBanner = ({ status, winner, onReset }: GameOverBannerProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-xl shadow-xl border border-light-grey p-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800">{OUTCOME_TITLE[status]}</h2>
        <p className="text-very-dark-grey text-center">{getOutcomeDescription(status, winner)}</p>
        <button
          onClick={onReset}
          className="mt-2 px-8 py-3 rounded-lg bg-link text-white font-medium hover:opacity-80 transition-opacity"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
