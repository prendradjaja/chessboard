import type { Position, Piece, Coordinates } from './index'

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

// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
