// src/game/HexBoard.js

// Hexagonal board - Abalone style with 61 cells
// Using cube coordinates (q, r, s) where q + r + s = 0

class HexBoard {
  constructor() {
    this.cells = {};
    this.boardRadius = 4; // 4 rings around center = 61 cells
    this.player1Marbles = []; // White marbles
    this.player2Marbles = []; // Black marbles
    this.player1Score = 0; // Kitne opponent marbles push off kiye
    this.player2Score = 0;
    this.currentPlayer = 1;
    this.winScore = 6; // 6 marbles push off = win

    this.initBoard();
    this.placeMarbles();
  }

  // 61 hexagonal cells generate karo
  initBoard() {
    this.cells = {};
    for (let q = -this.boardRadius; q <= this.boardRadius; q++) {
      for (let r = -this.boardRadius; r <= this.boardRadius; r++) {
        const s = -q - r;
        if (Math.abs(s) <= this.boardRadius) {
          const key = `${q},${r},${s}`;
          this.cells[key] = {
            q: q,
            r: r,
            s: s,
            marble: null, // null = empty, 1 = player1, 2 = player2
          };
        }
      }
    }
  }

  // Starting positions - Abalone classic layout
  placeMarbles() {
    this.player1Marbles = [];
    this.player2Marbles = [];

    // Player 1 (White) - Top side
    const p1Positions = [
      // Row 1 (top) - 5 marbles
      [-4, 0, 4], [-3, -1, 4], [-2, -2, 4], [-1, -3, 4], [0, -4, 4],
      // Row 2 - 6 marbles
      [-4, 1, 3], [-3, 0, 3], [-2, -1, 3], [-1, -2, 3], [0, -3, 3], [1, -4, 3],
      // Row 3 - 3 center marbles
      [-2, 0, 2], [-1, -1, 2], [0, -2, 2],
    ];

    // Player 2 (Black) - Bottom side
    const p2Positions = [
      // Row 1 (bottom) - 5 marbles
      [4, 0, -4], [3, 1, -4], [2, 2, -4], [1, 3, -4], [0, 4, -4],
      // Row 2 - 6 marbles
      [4, -1, -3], [3, 0, -3], [2, 1, -3], [1, 2, -3], [0, 3, -3], [-1, 4, -3],
      // Row 3 - 3 center marbles
      [2, 0, -2], [1, 1, -2], [0, 2, -2],
    ];

    p1Positions.forEach((pos) => {
      const key = `${pos[0]},${pos[1]},${pos[2]}`;
      if (this.cells[key]) {
        this.cells[key].marble = 1;
        this.player1Marbles.push(key);
      }
    });

    p2Positions.forEach((pos) => {
      const key = `${pos[0]},${pos[1]},${pos[2]}`;
      if (this.cells[key]) {
        this.cells[key].marble = 2;
        this.player2Marbles.push(key);
      }
    });
  }

  // Cell ka data lo
  getCell(q, r, s) {
    const key = `${q},${r},${s}`;
    return this.cells[key] || null;
  }

  // Check if position board ke andar hai
  isValidPosition(q, r, s) {
    const key = `${q},${r},${s}`;
    return this.cells.hasOwnProperty(key);
  }

  // 6 directions in hex (cube coordinates)
  static DIRECTIONS = {
    right: [1, 0, -1],
    topRight: [1, -1, 0],
    topLeft: [0, -1, 1],
    left: [-1, 0, 1],
    bottomLeft: [-1, 1, 0],
    bottomRight: [0, 1, -1],
  };

  // Get neighbor cell in a direction
  getNeighbor(q, r, s, direction) {
    const dir = HexBoard.DIRECTIONS[direction];
    if (!dir) return null;
    const nq = q + dir[0];
    const nr = r + dir[1];
    const ns = s + dir[2];
    return { q: nq, r: nr, s: ns };
  }

  // Get all 6 neighbors of a cell
  getNeighbors(q, r, s) {
    const neighbors = [];
    Object.keys(HexBoard.DIRECTIONS).forEach((dir) => {
      const n = this.getNeighbor(q, r, s, dir);
      if (n && this.isValidPosition(n.q, n.r, n.s)) {
        neighbors.push({ ...n, direction: dir });
      }
    });
    return neighbors;
  }

  // Deep copy of board (AI ke liye)
  clone() {
    const newBoard = new HexBoard();
    newBoard.cells = {};
    Object.keys(this.cells).forEach((key) => {
      newBoard.cells[key] = { ...this.cells[key] };
    });
    newBoard.player1Marbles = [...this.player1Marbles];
    newBoard.player2Marbles = [...this.player2Marbles];
    newBoard.player1Score = this.player1Score;
    newBoard.player2Score = this.player2Score;
    newBoard.currentPlayer = this.currentPlayer;
    return newBoard;
  }

  // Board state as string (for AI memoization)
  getStateHash() {
    const marbles = Object.keys(this.cells)
      .filter((key) => this.cells[key].marble !== null)
      .map((key) => `${key}:${this.cells[key].marble}`)
      .sort()
      .join('|');
    return `${marbles}_p${this.currentPlayer}`;
  }
}

export default HexBoard;
