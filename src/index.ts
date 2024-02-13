// Migration notes:
// - Chessboard(...) -> new Chessboard(...)
// - first argument of constructor/function: 'someId' -> '#someId'
// - move() param type


// set position -- with or without animation
// get position

// drag handler

import { makeStartingPosition, validateMove } from "./queens-quadrille";
import { Chessboard, Coordinates, shallowEquals, PlacedPiece } from "./chessboard";

const $ = document.querySelector.bind(document);

// "row, col" coordinates, zero-indexed
// TODO change coordinate system? it's maybe confusing that y-axis is flipped, etc
function main() {
  // runUnitTests();

  let board: Chessboard;
  board = new Chessboard(makeStartingPosition(), '#my-board', 4);

  const goalSquares: Coordinates[] = [[0, 0], [0, 3], [3, 0], [3, 3]];
  for (let each of goalSquares) {
    board.getSquareElement(each).classList.add('unreached-goal');
  }

  let goalsReached = new Set();
  let alreadyAnnouncedWin = false;

  board.setMoveValidator(validateMove);

  board.setMoveListener(move => {
    if (
      board.getPiece(move.end)?.type === 'q'
      && goalSquares.some(square => shallowEquals(square, move.end))
    ) {
      board.getSquareElement(move.end).classList.add('reached-goal');
      goalsReached.add(JSON.stringify(move.end));
      if (goalsReached.size === goalSquares.length && !alreadyAnnouncedWin) {
        alreadyAnnouncedWin = true;
          $('.congratulations')?.classList.remove('hidden');
      }
    }
  });
}

main();
