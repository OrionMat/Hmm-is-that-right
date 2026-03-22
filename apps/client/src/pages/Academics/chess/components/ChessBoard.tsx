import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import type { GameStatus, PlayerColor } from "../chessModel";

interface ChessBoardProps {
  fen: string;
  onDrop: (args: PieceDropHandlerArgs) => boolean;
  status: GameStatus;
  boardOrientation?: PlayerColor;
}

export const ChessBoard = ({ fen, onDrop, status, boardOrientation = "w" }: ChessBoardProps) => {
  return (
    <div className="w-full max-w-[560px]">
      <Chessboard
        options={{
          position: fen,
          onPieceDrop: onDrop,
          allowDragging: status === "active",
          boardOrientation: boardOrientation === "w" ? "white" : "black",
          boardStyle: {
            borderRadius: "8px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          },
        }}
      />
    </div>
  );
};
