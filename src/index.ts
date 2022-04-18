// Migration notes:
// - Chessboard(...) -> new Chessboard(...)
// - first argument of constructor/function: 'someId' -> '#someId'

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// const $ = s => document.querySelector(s);
// const $$ = s => document.querySelectorAll(s);

const BOARD_SIZE = 8; // height & width in squares -- duplicated in styles.css

type Position = PlacedPiece[]; // TODO name?

interface PlacedPiece {
  type: 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
  color: 'w' | 'b';
  coordinates: [number, number];
}

function main() {
  new Chessboard('#my-board');
}

class Chessboard {
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

    this.renderPosition([
      { type: 'k', color: 'w', coordinates: [0, 0] },
      { type: 'n', color: 'b', coordinates: [2, 1] },
    ]);
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
}

// set position -- with or without animation
// get position

// drag handler

main();
