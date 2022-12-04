import type { Position, Piece, Coordinates, Move, Chessboard } from './index'

export function makeStartingPosition(): Position {
  const pieces: Piece[] = [
    { type: 'r', color: 'b' },
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'k', color: 'b' },
    // { type: 'q', color: 'b' },
    { type: 'r', color: 'w' },
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'q', color: 'w' },
  ];
  const squares: Coordinates[] = [0, 1, 2, 3]
    .flatMap(z =>
      [0, 1, 2, 3].map(w => [z, w] as Coordinates)
    );
  shuffleArray(squares);
  squares.pop();
  return squares.map((coordinates, i) => ({
    coordinates,
    ...pieces[i],
  }));
}

export function validateMove(move: Move, board: Chessboard): boolean {
  const { start, end } = move;
  if (board.getPiece(end)) {
    return false;
  }

  const { type: pieceType } = board.getPiece(start)!;

  const allowedMoves: Record<string, string[]> = {};
  allowedMoves.r = [[0, 1], [1, 0], [0, -1], [-1, 0]].map(x => x.toString());
  allowedMoves.b = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(x => x.toString());
  allowedMoves.n = [[1, 2], [-1, 2], [-1, -2], [1, -2], [2, 1], [-2, 1], [-2, -1], [2, -1]].map(x => x.toString());
  allowedMoves.k = [...allowedMoves.r, ...allowedMoves.b];
  allowedMoves.q = [...allowedMoves.k];

  const delta = [
    end[0] - start[0],
    end[1] - start[1],
  ].toString();

  return allowedMoves[pieceType].includes(delta);

  return true;
}

// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
