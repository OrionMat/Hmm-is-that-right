export type GameStatus = "active" | "checkmate" | "stalemate" | "draw" | "resigned";

export type PlayerColor = "w" | "b";

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface ChessState {
  fen: string;
  status: GameStatus;
  turn: PlayerColor;
  isCheck: boolean;
  moveHistory: string[];
  capturedByWhite: string[];
  capturedByBlack: string[];
  winner: PlayerColor | null;
  promotionPending: ChessMove | null;
}
