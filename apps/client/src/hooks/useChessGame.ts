import { useState, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import type { PieceDropHandlerArgs } from "react-chessboard";
import type { GameStatus, PlayerColor, ChessMove } from "../pages/Academics/chess/chessModel";

const STARTING_COUNTS: Record<string, number> = {
  p: 8, n: 2, b: 2, r: 2, q: 1, k: 1,
};

function deriveStatus(chess: Chess): GameStatus {
  if (chess.isCheckmate()) return "checkmate";
  if (chess.isStalemate()) return "stalemate";
  if (chess.isDraw()) return "draw";
  return "active";
}

function deriveCaptured(chess: Chess) {
  const remaining: Record<string, number> = {};
  for (const row of chess.board()) {
    for (const square of row) {
      if (square) {
        const key = `${square.color}${square.type}`;
        remaining[key] = (remaining[key] ?? 0) + 1;
      }
    }
  }
  const capturedByWhite: string[] = [];
  const capturedByBlack: string[] = [];
  for (const type of ["p", "n", "b", "r", "q"]) {
    const startCount = STARTING_COUNTS[type];
    const blackRemaining = remaining[`b${type}`] ?? 0;
    const whiteRemaining = remaining[`w${type}`] ?? 0;
    for (let i = 0; i < startCount - blackRemaining; i++) capturedByWhite.push(type);
    for (let i = 0; i < startCount - whiteRemaining; i++) capturedByBlack.push(type);
  }
  return { capturedByWhite, capturedByBlack };
}

function isPromotionMove(chess: Chess, from: string, to: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const piece = chess.get(from as any);
  if (!piece || piece.type !== "p") return false;
  const toRank = to[1];
  return (piece.color === "w" && toRank === "8") || (piece.color === "b" && toRank === "1");
}

export const useChessGame = () => {
  // Stable chess instance — mutated in-place on each move.
  // useMemo with [] gives a single instance for the component's lifetime.
  const chess = useMemo(() => new Chess(), []);

  // fen is the React state that drives re-renders. After every successful move
  // we call setFen(chess.fen()) so React re-renders and passes the new position
  // to react-chessboard. This is the standard pattern from react-chessboard docs.
  const [fen, setFen] = useState(() => chess.fen());

  const [promotionPending, setPromotionPending] = useState<ChessMove | null>(null);
  const [resigned, setResigned] = useState(false);

  // All chess-derived values are computed fresh on every render (triggered by setFen).
  const turn = chess.turn() as PlayerColor;
  const status: GameStatus = resigned ? "resigned" : deriveStatus(chess);
  const isCheck = chess.isCheck();
  const moveHistory = chess.history();
  const winner: PlayerColor | null =
    status === "checkmate" || status === "resigned"
      ? turn === "w" ? "b" : "w"
      : null;
  const { capturedByWhite, capturedByBlack } = deriveCaptured(chess);

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare) return false;
      if (chess.isGameOver() || resigned) return false;

      if (isPromotionMove(chess, sourceSquare, targetSquare)) {
        setPromotionPending({ from: sourceSquare, to: targetSquare });
        return true;
      }

      try {
        chess.move({ from: sourceSquare, to: targetSquare });
      } catch {
        return false;
      }

      setFen(chess.fen());
      return true;
    },
    [chess, resigned],
  );

  const handlePromotion = useCallback(
    (piece: string) => {
      if (!promotionPending) return;
      try {
        chess.move({ from: promotionPending.from, to: promotionPending.to, promotion: piece });
        setFen(chess.fen());
      } catch {
        // move was invalid — just close the dialog
      }
      setPromotionPending(null);
    },
    [chess, promotionPending],
  );

  const handlePromotionCancel = useCallback(() => {
    setPromotionPending(null);
  }, []);

  const handleReset = useCallback(() => {
    chess.reset();
    setFen(chess.fen());
    setPromotionPending(null);
    setResigned(false);
  }, [chess]);

  const handleResign = useCallback(() => {
    setResigned(true);
  }, []);

  return {
    fen,
    status,
    turn,
    isCheck,
    moveHistory,
    capturedByWhite,
    capturedByBlack,
    winner,
    promotionPending,
    onDrop: handlePieceDrop,
    onPromotionSelect: handlePromotion,
    onPromotionCancel: handlePromotionCancel,
    onReset: handleReset,
    onResign: handleResign,
  };
};
