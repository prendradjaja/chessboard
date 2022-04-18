// Migration notes:
// - Chessboard(...) -> new Chessboard(...)
// - first argument of constructor/function: 'someId' -> '#someId'

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
// const $ = s => document.querySelector(s);
// const $$ = s => document.querySelectorAll(s);

const BOARD_SIZE = 8; // height & width in squares -- duplicated in styles.css

function main() {
  new Chessboard('#my-board');
}

class Chessboard {
  private root: HTMLElement;
  private mainLayer!: HTMLElement;
  private coordinatesLayer!: HTMLElement;

  constructor(selector: string) {
    const root = $(selector);
    if (!root) {
      throw new Error('Root element not found');
    }
    this.root = root as HTMLElement;
    this.render();
  }

  private render(): void {
    // <div class="main-layer">
    this.mainLayer = document.createElement('div');
    this.root.appendChild(this.mainLayer);
    this.mainLayer.classList.add('main-layer');

    //   <div class="square" />
    // [</div.main-layer>]
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const square = document.createElement('div');
        this.mainLayer.appendChild(square);
        const squareColor = (r + c) % 2 === 0 ? 'light' : 'dark';
        square.classList.add('square', squareColor);
      }
    }

    // <div class="coordinates-layer" />
    this.coordinatesLayer = document.createElement('div');
    this.root.appendChild(this.coordinatesLayer);
    this.coordinatesLayer.classList.add('coordinates-layer');
  }
}

// set position -- with or without animation
// get position

// drag handler

main();
