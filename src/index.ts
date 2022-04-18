// Migration notes:
// - Chessboard(...) -> new Chessboard(...)
// - first argument of constructor/function: 'someId' -> '#someId'
// - move() param type


// set position -- with or without animation
// get position

// drag handler

import { operaGame } from "./opera-game";
import { startingPosition } from "./starting-position";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// const $ = s => document.querySelector(s);
// const $$ = s => document.querySelectorAll(s);

const BOARD_SIZE = 8; // height & width in squares -- duplicated in styles.css

// "row, col" coordinates, zero-indexed
// TODO change coordinate system? it's maybe confusing that y-axis is flipped, etc
type Coordinates = [number, number];

export type Move = { start: Coordinates, end: Coordinates };

export type Position = PlacedPiece[]; // TODO name?

interface PlacedPiece {
  type: 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
  color: 'w' | 'b';
  coordinates: Coordinates;
}

function main() {
  const board = new Chessboard('#my-board');

  for (let move of operaGame) {
    board.move(move);
  }
}

class Chessboard {
  private position: Position = JSON.parse(JSON.stringify(startingPosition));

  private root: HTMLElement;
  private mainLayer!: HTMLElement;
  private coordinatesLayer!: HTMLElement;

  private squares: Partial<Record<string, HTMLElement>>; // What type should I use?

  // private piecesLayer!: HTMLElement;

  constructor(selector: string) {
    const root = $(selector);
    if (!root) {
      throw new Error('Root element not found');
    }
    this.root = root as HTMLElement;
    this.squares = {};
    this.renderBoard();

    this.renderPosition(startingPosition);
  }

  public move(move: Move): void {
    // TODO e.p. and promotion are unimplemented, but require a bit
    // more work/reworking than castling... do I need to do all this to make
    // Sovereign Chess, anyway?

    const isCastling = this.isCastling(move);

    // TODO DRY this predicate -- also used in isCastling
    const piece = popBy(
      this.position,
      (piece: PlacedPiece) => piece.coordinates[0] === move.start[0] && piece.coordinates[1] === move.start[1]
    );
    discardBy(
      this.position,
      (piece: PlacedPiece) => piece.coordinates[0] === move.end[0] && piece.coordinates[1] === move.end[1]
    );
    this.position.push({
      ...piece,
      coordinates: move.end,
    });

    if (isCastling) {
      let startRow = move.start[0];
      let endRow = startRow;
      let startCol: number, endCol: number;
      if (move.end[1] === 2) {
        startCol = 0;
        endCol = 3;
      } else if (move.end[1] === 6) {
        startCol = 7;
        endCol = 5;
      } else {
        // TODO ts-essentials UnreachableCaseError
        console.error('Unreachable case');
        return;
      }
      this.move({ start: [startRow, startCol], end: [endRow, endCol] });
      return;
    }

    this.renderPosition(this.position);
  }

  private renderBoard(): void {
    // // <div class="pieces-layer">
    // this.piecesLayer = document.createElement('div');
    // this.root.appendChild(this.piecesLayer);

    // <div class="main-layer">
    this.mainLayer = document.createElement('div');
    this.root.appendChild(this.mainLayer);
    this.mainLayer.classList.add('main-layer');

    //   <div class="square" />
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const square = document.createElement('div');
        this.mainLayer.appendChild(square);
        const squareColor = (r + c) % 2 === 0 ? 'light' : 'dark';
        square.classList.add('square', squareColor);
        this.squares[`${r}-${c}`] = square;
      }
    }
    // </div.main-layer>

    // <div class="coordinates-layer" />
    this.coordinatesLayer = document.createElement('div');
    this.root.appendChild(this.coordinatesLayer);
    this.coordinatesLayer.classList.add('coordinates-layer');
  }

  private renderPosition(position: Position): void {
    this.clearBoard();
    for (let piece of position) {
      const squareEl = this.getSquareElement(piece.coordinates[0], piece.coordinates[1]);
      const pieceEl = document.createElement('img');
      squareEl.appendChild(pieceEl);
      pieceEl.src = `./images/pieces/${piece.color}${piece.type}.svg`;
    }
  }

  private clearBoard(): void {
    for (let square of Object.values(this.squares)) {
      square!.innerHTML = ''; // Why do I need to tell TS that square is not undefined?
    }
  }

  private getSquareElement(r: number, c: number): HTMLElement {
    return this.squares[`${r}-${c}`]!;
  }

  private isCastling(move: Move) {
    const piece = this.position.find(
      (piece: PlacedPiece) => piece.coordinates[0] === move.start[0] && piece.coordinates[1] === move.start[1]
    )!;
    return (
      piece.type === 'k' &&
      move.start[1] === 4 &&
      (move.end[1] === 2 || move.end[1] === 6)
    );
  }
}

/**
 * Find the first element of `arr` that matches `predicate`. Remove and
 * return it.
 *
 * If none match, throw an Error.
 */
function popBy<T>(arr: T[], predicate: (T) => boolean): T {
  const index = arr.findIndex(predicate);
  if (index === -1) {
    throw new Error("Element not found");
  }
  const [item] = arr.splice(index, 1);
  return item;
}

/**
 * Remove the first element of `arr` that matches `predicate` (if any exists).
 */
function discardBy<T>(arr: T[], predicate: (T) => boolean): void {
  const index = arr.findIndex(predicate);
  if (index === -1) {
    return;
  }
  arr.splice(index, 1);
}

main();
