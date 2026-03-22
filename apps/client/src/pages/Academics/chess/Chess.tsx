import { useState } from "react";
import { useChessGame } from "../../../hooks/useChessGame";
import { PageContainer } from "../../../components/PageContainer";
import { ChessBoard } from "./components/ChessBoard";
import { ChessControls } from "./components/ChessControls";
import { PromotionDialog } from "./components/PromotionDialog";
import { GameOverBanner } from "./components/GameOverBanner";
import { MoveHistory } from "./components/MoveHistory";
import { CapturedPieces } from "./components/CapturedPieces";
import type { PlayerColor } from "./chessModel";

export const Chess = () => {
  const game = useChessGame();
  const [boardOrientation, setBoardOrientation] = useState<PlayerColor>("w");

  const isGameOver =
    game.status === "checkmate" ||
    game.status === "stalemate" ||
    game.status === "draw" ||
    game.status === "resigned";

  const handleFlipBoard = () => {
    setBoardOrientation((prev) => (prev === "w" ? "b" : "w"));
  };

  return (
    <PageContainer>
      <div className="flex flex-col items-center w-full">
        <ChessControls
          status={game.status}
          turn={game.turn}
          isCheck={game.isCheck}
          winner={game.winner}
          boardOrientation={boardOrientation}
          onReset={game.onReset}
          onResign={game.onResign}
          onFlipBoard={handleFlipBoard}
        />

        <div className="flex gap-6 items-start">
          <div className="flex flex-col items-center gap-2">
            <CapturedPieces pieces={game.capturedByWhite} color="w" />
            <ChessBoard
              fen={game.fen}
              onDrop={game.onDrop}
              status={game.status}
              boardOrientation={boardOrientation}
            />
            <CapturedPieces pieces={game.capturedByBlack} color="b" />
          </div>

          <MoveHistory moves={game.moveHistory} />
        </div>
      </div>

      {game.promotionPending && (
        <PromotionDialog
          color={game.turn}
          onSelect={game.onPromotionSelect}
          onCancel={game.onPromotionCancel}
        />
      )}

      {isGameOver && (
        <GameOverBanner
          status={game.status}
          winner={game.winner}
          onReset={game.onReset}
        />
      )}
    </PageContainer>
  );
};
