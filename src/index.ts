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

interface Piece {
  type: 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
  color: 'w' | 'b';
}

interface PlacedPiece extends Piece {
  coordinates: Coordinates;
}

function main() {
  const board = new Chessboard('#my-board');

  // for (let move of operaGame) {
  //   board.move(move);
  // }
}

class Chessboard {
  private position: Position = JSON.parse(JSON.stringify(startingPosition));

  private root: HTMLElement;
  private mainLayer!: HTMLElement;
  private coordinatesLayer!: HTMLElement;

  private squares: Partial<Record<string, HTMLElement>>; // What type should I use?

  private currentDrag: undefined | {
    movingElement: HTMLElement,
    removeListeners: () => void,
  };

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

    const piece = this.removePiece(move.start)!; // TODO This function assumes the move given is valid (hence the !). Should I do validation?
    this.removePiece(move.end);
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
    this.root.classList.add('chessboard');

    // // <div class="pieces-layer">
    // this.piecesLayer = document.createElement('div');
    // this.root.appendChild(this.piecesLayer);

    // <div class="coordinates-layer" />
    this.coordinatesLayer = document.createElement('div');
    this.root.appendChild(this.coordinatesLayer);
    this.coordinatesLayer.classList.add('coordinates-layer');

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

        square.attributes['data-coordinates-r'] = r;
        square.attributes['data-coordinates-c'] = c;

        // square.addEventListener('click', () => this.handleClick([r, c]));
        square.addEventListener('mousedown', (event) => this.onDragStart(event, [r, c]));

      }
    }
    // </div.main-layer>
  }

  private renderPosition(position: Position): void {
    this.clearBoard();
    for (let piece of position) {
      const squareEl = this.getSquareElement(piece.coordinates);
      squareEl.appendChild(createPieceImg(piece));
    }
  }

  // private updateSelectedSquare(square: Coordinates | undefined): void {
  //   if (this.selectedSquare) {
  //     this.getSquareElement(this.selectedSquare).classList.remove('selected');
  //   }
  //   this.selectedSquare = square;
  //   if (square) {
  //     this.getSquareElement(square).classList.add('selected');
  //   }
  // }

  private clearBoard(): void {
    for (let square of Object.values(this.squares)) {
      square!.innerHTML = ''; // Why do I need to tell TS that square is not undefined?
    }
  }

  // private handleClick(square: Coordinates): void {
  //   if (!this.selectedSquare && this.getPiece(square)) {
  //     // Initiate a move
  //     this.updateSelectedSquare(square);
  //   } else if (this.selectedSquare) {
  //     // Make a move
  //     const start = this.selectedSquare;
  //     const end = square;
  //     this.updateSelectedSquare(undefined);
  //     this.move({ start, end });
  //   }
  // }

  private onDragStart(event: MouseEvent, square: Coordinates): void {
    const piece = this.getPiece(square);
    if (!piece) {
      return;
    }

    // Update classes on existing elements
    {
      const squareElement = this.getSquareElement(square);
      squareElement.classList.add('is-being-dragged');

      this.root.classList.add('drag-mode');
    }

    // Add "moving piece" element
    const movingElement = createPieceImg(piece);
    document.body.appendChild(movingElement);
    movingElement.style.position = 'absolute';
    // movingElement.style.cursor = 'pointer';
    movingElement.style.pointerEvents = 'none';
    movingElement.style.width = '100px'; // TODO DRY
    movingElement.style.left = `${event.clientX - 50}px`;
    movingElement.style.top = `${event.clientY - 50}px`;

    // Listeners
    let removeListeners;
    {
      const mousemoveListener = event => this.onDrag(event);
      window.addEventListener('mousemove', mousemoveListener);

      const mouseupListener = () => this.onDragEnd(square);
      window.addEventListener('mouseup', mouseupListener);

      removeListeners = () => {
        window.removeEventListener('mousemove', mousemoveListener);
        window.removeEventListener('mouseup', mouseupListener);
      };
    }

    this.currentDrag = {
      movingElement,
      removeListeners,
    }
  }

  private onDrag(event: MouseEvent): void {
    if (!this.currentDrag) {
      return;
    }

    const { movingElement } = this.currentDrag;

    movingElement.style.left = `${event.clientX - 50}px`;
    movingElement.style.top = `${event.clientY - 50}px`;

    // const x = this.currentDrag.initialElementX + event.clientX - this.currentDrag.initialMouseX;
    // const y = this.currentDrag.initialElementY + event.clientY - this.currentDrag.initialMouseY;
    //
    // this.element.style.left = `${x}px`;
    // this.element.style.top = `${y}px`;
  }

  // TODO Rename square? It is the square we started dragging on.
  private onDragEnd(square: Coordinates): void {
    if (!this.currentDrag) {
      return;
    }

    const squareEl = this.getSquareElement(square);
    squareEl.classList.remove('is-being-dragged');

    this.root.classList.remove('drag-mode');

    this.currentDrag.movingElement.remove();

    this.currentDrag.removeListeners();

    const hoveredElement = $('.chessboard .square:hover');
    if (hoveredElement) {
      const r: number = +hoveredElement.attributes['data-coordinates-r'];
      const c: number = +hoveredElement.attributes['data-coordinates-c'];
      this.move({ start: square, end: [r, c] });
    }

    this.currentDrag = undefined;
  }

  private getSquareElement(coordinates: Coordinates): HTMLElement {
    const [r, c] = coordinates;
    return this.squares[`${r}-${c}`]!;
  }

  private getPiece(square: Coordinates): PlacedPiece | undefined {
    return this.position.find(
      (piece: PlacedPiece) => piece.coordinates[0] === square[0] && piece.coordinates[1] === square[1]
    );
  }

  /**
   * Returns the removed piece, if any.
   */
  private removePiece(square: Coordinates): Piece | undefined {
    const index = this.position.findIndex(
      (piece: PlacedPiece) => piece.coordinates[0] === square[0] && piece.coordinates[1] === square[1]
    );

    if (index === -1) {
      return undefined;
    } else {
      const [placedPiece] = this.position.splice(index, 1);
      const { coordinates, ...piece } = placedPiece;
      return piece;
    }
  }

  private isCastling(move: Move) {
    const piece = this.getPiece(move.start);
    return (
      piece?.type === 'k' &&
      move.start[1] === 4 &&
      (move.end[1] === 2 || move.end[1] === 6)
    );
  }
}

// I wonder if it's more or less maintainable to have this function also appendChild
function createPieceImg(piece: PlacedPiece): HTMLImageElement {
  const pieceEl = document.createElement('img');
  pieceEl.src = `./images/pieces/${piece.color}${piece.type}.svg`;
  pieceEl.draggable = false;
  return pieceEl;
}

main();
