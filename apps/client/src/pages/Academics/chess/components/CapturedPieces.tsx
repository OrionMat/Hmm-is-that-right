import type { PlayerColor } from "../chessModel";

interface CapturedPiecesProps {
  pieces: string[];
  color: PlayerColor;
}

// Pieces captured by the given color are the opponent's pieces
const PIECE_UNICODE: Record<string, Record<PlayerColor, string>> = {
  p: { w: "♟", b: "♙" },
  n: { w: "♞", b: "♘" },
  b: { w: "♝", b: "♗" },
  r: { w: "♜", b: "♖" },
  q: { w: "♛", b: "♕" },
};

// Captured pieces are opponent pieces — if white captured them, display as black pieces
const OPPONENT: Record<PlayerColor, PlayerColor> = { w: "b", b: "w" };

export const CapturedPieces = ({ pieces, color }: CapturedPiecesProps) => {
  const opponentColor = OPPONENT[color];

  return (
    <div className="flex flex-wrap gap-0.5 min-h-[24px] w-full max-w-[560px] mx-auto">
      {pieces.map((piece, i) => (
        <span key={i} className="text-xl leading-none" aria-hidden="true">
          {PIECE_UNICODE[piece]?.[opponentColor] ?? ""}
        </span>
      ))}
    </div>
  );
};
