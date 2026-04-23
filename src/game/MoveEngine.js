// src/game/MoveEngine.js - COMPLETE REPLACEMENT
// Puri file replace karo - Push mechanics fixed

class MoveEngine {
  // Check if marbles ek line mein hain
  static areInLine(marbles) {
    if (marbles.length === 1) return true;
    if (marbles.length > 3) return false;

    const sorted = this.sortByPosition(marbles);

    if (marbles.length === 2) {
      const dq = sorted[1].q - sorted[0].q;
      const dr = sorted[1].r - sorted[0].r;
      const ds = sorted[1].s - sorted[0].s;
      return this.isValidDirection(dq, dr, ds);
    }

    if (marbles.length === 3) {
      const dq1 = sorted[1].q - sorted[0].q;
      const dr1 = sorted[1].r - sorted[0].r;
      const ds1 = sorted[1].s - sorted[0].s;
      const dq2 = sorted[2].q - sorted[1].q;
      const dr2 = sorted[2].r - sorted[1].r;
      const ds2 = sorted[2].s - sorted[1].s;
      return (
        this.isValidDirection(dq1, dr1, ds1) &&
        dq1 === dq2 && dr1 === dr2 && ds1 === ds2
      );
    }
    return false;
  }

  static isValidDirection(dq, dr, ds) {
    const validDirs = [
      [1, 0, -1], [1, -1, 0], [0, -1, 1],
      [-1, 0, 1], [-1, 1, 0], [0, 1, -1],
    ];
    return validDirs.some(d => d[0] === dq && d[1] === dr && d[2] === ds);
  }

  static getDirectionDelta(direction) {
    const dirs = {
      right: [1, 0, -1],
      topRight: [1, -1, 0],
      topLeft: [0, -1, 1],
      left: [-1, 0, 1],
      bottomLeft: [-1, 1, 0],
      bottomRight: [0, 1, -1],
    };
    return dirs[direction] || null;
  }

  static getDirectionName(dq, dr, ds) {
    const dirMap = {
      '1,0,-1': 'right',
      '1,-1,0': 'topRight',
      '0,-1,1': 'topLeft',
      '-1,0,1': 'left',
      '-1,1,0': 'bottomLeft',
      '0,1,-1': 'bottomRight',
    };
    return dirMap[`${dq},${dr},${ds}`] || null;
  }

  // ===== FIXED: Get line direction from marbles =====
  static getLineDirection(marbles) {
    if (marbles.length < 2) return null;
    const sorted = this.sortByPosition(marbles);
    const dq = sorted[1].q - sorted[0].q;
    const dr = sorted[1].r - sorted[0].r;
    const ds = sorted[1].s - sorted[0].s;
    return { dq, dr, ds };
  }

  // ===== FIXED: Check if move is inline with marble line =====
  static isInlineMove(marbles, direction) {
    if (marbles.length === 1) return true;

    const lineDir = this.getLineDirection(marbles);
    if (!lineDir) return false;

    const moveDir = this.getDirectionDelta(direction);
    if (!moveDir) return false;

    // Same direction OR opposite direction = inline
    const isSame = (lineDir.dq === moveDir[0] && lineDir.dr === moveDir[1] && lineDir.ds === moveDir[2]);
    const isOpposite = (lineDir.dq === -moveDir[0] && lineDir.dr === -moveDir[1] && lineDir.ds === -moveDir[2]);

    return isSame || isOpposite;
  }

  // ===== FIXED: Get front marble in move direction =====
  static getFrontMarble(marbles, direction) {
    const dir = this.getDirectionDelta(direction);
    if (!dir) return marbles[0];

    let front = marbles[0];
    let maxScore = front.q * dir[0] + front.r * dir[1] + front.s * dir[2];

    for (let i = 1; i < marbles.length; i++) {
      const score = marbles[i].q * dir[0] + marbles[i].r * dir[1] + marbles[i].s * dir[2];
      if (score > maxScore) {
        maxScore = score;
        front = marbles[i];
      }
    }
    return front;
  }

  // ===== FIXED: Get back marble (opposite of front) =====
  static getBackMarble(marbles, direction) {
    const dir = this.getDirectionDelta(direction);
    if (!dir) return marbles[0];

    let back = marbles[0];
    let minScore = back.q * dir[0] + back.r * dir[1] + back.s * dir[2];

    for (let i = 1; i < marbles.length; i++) {
      const score = marbles[i].q * dir[0] + marbles[i].r * dir[1] + marbles[i].s * dir[2];
      if (score < minScore) {
        minScore = score;
        back = marbles[i];
      }
    }
    return back;
  }

  // ===== MAIN: Get all valid moves for selected marbles =====
  static getValidMoves(board, selectedMarbles, player) {
    const validMoves = [];

    if (selectedMarbles.length === 0 || selectedMarbles.length > 3) {
      return validMoves;
    }

    // Check all marbles belong to player
    for (const marble of selectedMarbles) {
      const cell = board.getCell(marble.q, marble.r, marble.s);
      if (!cell || cell.marble !== player) return validMoves;
    }

    // Check if in line
    if (!this.areInLine(selectedMarbles)) return validMoves;

    const directions = ['right', 'topRight', 'topLeft', 'left', 'bottomLeft', 'bottomRight'];

    directions.forEach(direction => {
      const isInline = this.isInlineMove(selectedMarbles, direction);

      if (isInline) {
        // INLINE MOVE - can push
        const move = this.validateInlineMove(board, selectedMarbles, direction, player);
        if (move) validMoves.push(move);
      } else {
        // BROADSIDE MOVE - no push, just slide
        if (selectedMarbles.length > 1) {
          const move = this.validateBroadsideMove(board, selectedMarbles, direction, player);
          if (move) validMoves.push(move);
        }
      }
    });

    return validMoves;
  }

  // ===== FIXED: Inline move with PUSH logic =====
  static validateInlineMove(board, marbles, direction, player) {
    const dir = this.getDirectionDelta(direction);
    if (!dir) return null;

    const opponent = player === 1 ? 2 : 1;
    const myCount = marbles.length;

    // Find front marble in this direction
    const frontMarble = this.getFrontMarble(marbles, direction);

    // Look ahead from front marble
    let lookQ = frontMarble.q + dir[0];
    let lookR = frontMarble.r + dir[1];
    let lookS = frontMarble.s + dir[2];

    // Case 1: Front cell is off board - CANNOT move (own marble falls off)
    if (!board.isValidPosition(lookQ, lookR, lookS)) {
      return null;
    }

    const frontCell = board.getCell(lookQ, lookR, lookS);

    // Case 2: Front cell is EMPTY - simple move
    if (frontCell.marble === null) {
      return {
        type: 'inline',
        direction: direction,
        marbles: marbles.map(m => ({ ...m })),
        push: 0,
        pushOff: false,
      };
    }

    // Case 3: Front cell has OWN marble - BLOCKED
    if (frontCell.marble === player) {
      return null;
    }

    // Case 4: Front cell has OPPONENT marble - TRY TO PUSH
    let opponentCount = 0;
    let scanQ = lookQ;
    let scanR = lookR;
    let scanS = lookS;

    // Count consecutive opponent marbles
    while (board.isValidPosition(scanQ, scanR, scanS)) {
      const scanCell = board.getCell(scanQ, scanR, scanS);

      if (scanCell.marble === opponent) {
        opponentCount++;
        scanQ += dir[0];
        scanR += dir[1];
        scanS += dir[2];
      } else if (scanCell.marble === null) {
        // Empty space found - push INTO this space
        break;
      } else if (scanCell.marble === player) {
        // Own marble behind opponents - BLOCKED
        return null;
      }
    }

    // PUSH RULE: Must have MORE marbles than opponent
    // 2v1 OK, 3v1 OK, 3v2 OK
    // 1v1 NOT OK, 2v2 NOT OK, 1v2 NOT OK
    if (myCount <= opponentCount) {
      return null; // Cannot push equal or more
    }

    // Check if last opponent marble gets pushed OFF board
    const pushOff = !board.isValidPosition(scanQ, scanR, scanS);

    return {
      type: 'inline',
      direction: direction,
      marbles: marbles.map(m => ({ ...m })),
      push: opponentCount,
      pushOff: pushOff,
    };
  }

  // ===== FIXED: Broadside move =====
  static validateBroadsideMove(board, marbles, direction, player) {
    const dir = this.getDirectionDelta(direction);
    if (!dir) return null;

    // All destination cells must be empty (or occupied by a marble that's also moving)
    for (const marble of marbles) {
      const newQ = marble.q + dir[0];
      const newR = marble.r + dir[1];
      const newS = marble.s + dir[2];

      if (!board.isValidPosition(newQ, newR, newS)) {
        return null; // Off board
      }

      const destCell = board.getCell(newQ, newR, newS);
      if (destCell.marble !== null) {
        // Check if this destination is one of our moving marbles
        const isOurMovingMarble = marbles.some(
          m => m.q === newQ && m.r === newR && m.s === newS
        );
        if (!isOurMovingMarble) {
          return null; // Blocked by another marble
        }
      }
    }

    return {
      type: 'broadside',
      direction: direction,
      marbles: marbles.map(m => ({ ...m })),
      push: 0,
      pushOff: false,
    };
  }

  // ===== FIXED: Execute move on board =====
  static executeMove(board, move) {
    const dir = this.getDirectionDelta(move.direction);
    if (!dir) return board;

    const player = board.currentPlayer;
    const opponent = player === 1 ? 2 : 1;

    // STEP 1: If pushing opponents, move them FIRST
    if (move.type === 'inline' && move.push > 0) {
      const frontMarble = this.getFrontMarble(move.marbles, move.direction);

      // Collect opponent marble positions (in order from front)
      let opponentPositions = [];
      let scanQ = frontMarble.q + dir[0];
      let scanR = frontMarble.r + dir[1];
      let scanS = frontMarble.s + dir[2];

      for (let i = 0; i < move.push; i++) {
        opponentPositions.push({ q: scanQ, r: scanR, s: scanS });
        scanQ += dir[0];
        scanR += dir[1];
        scanS += dir[2];
      }

      // Move opponents from BACK to FRONT (farthest first)
      for (let i = opponentPositions.length - 1; i >= 0; i--) {
        const opp = opponentPositions[i];
        const oldKey = `${opp.q},${opp.r},${opp.s}`;
        const newQ = opp.q + dir[0];
        const newR = opp.r + dir[1];
        const newS = opp.s + dir[2];

        // Clear old position
        board.cells[oldKey].marble = null;

        if (board.isValidPosition(newQ, newR, newS)) {
          // Move to new position
          const newKey = `${newQ},${newR},${newS}`;
          board.cells[newKey].marble = opponent;

          // Update marble list
          if (opponent === 1) {
            const idx = board.player1Marbles.indexOf(oldKey);
            if (idx !== -1) board.player1Marbles[idx] = newKey;
          } else {
            const idx = board.player2Marbles.indexOf(oldKey);
            if (idx !== -1) board.player2Marbles[idx] = newKey;
          }
        } else {
          // ===== PUSH OFF BOARD! =====
          if (opponent === 1) {
            const idx = board.player1Marbles.indexOf(oldKey);
            if (idx !== -1) board.player1Marbles.splice(idx, 1);
            board.player2Score++; // Player 2 scores!
          } else {
            const idx = board.player2Marbles.indexOf(oldKey);
            if (idx !== -1) board.player2Marbles.splice(idx, 1);
            board.player1Score++; // Player 1 scores!
          }
        }
      }
    }

    // STEP 2: Move own marbles
    // For inline: move from front to back direction (front marble moves first to make space)
    // For broadside: order doesn't matter since destinations are always empty

    let sortedMarbles;
    if (move.type === 'inline') {
      // Move front marble first
      sortedMarbles = [...move.marbles].sort((a, b) => {
        const scoreA = a.q * dir[0] + a.r * dir[1] + a.s * dir[2];
        const scoreB = b.q * dir[0] + b.r * dir[1] + b.s * dir[2];
        return scoreB - scoreA; // Highest score (front) first
      });
    } else {
      sortedMarbles = [...move.marbles];
    }

    // First clear ALL old positions
    const oldPositions = sortedMarbles.map(m => ({
      key: `${m.q},${m.r},${m.s}`,
      newQ: m.q + dir[0],
      newR: m.r + dir[1],
      newS: m.s + dir[2],
    }));

    // Clear old positions
    oldPositions.forEach(pos => {
      board.cells[pos.key].marble = null;
    });

    // Set new positions
    oldPositions.forEach(pos => {
      const newKey = `${pos.newQ},${pos.newR},${pos.newS}`;
      board.cells[newKey].marble = player;

      // Update marble list
      if (player === 1) {
        const idx = board.player1Marbles.indexOf(pos.key);
        if (idx !== -1) {
          board.player1Marbles[idx] = newKey;
        }
      } else {
        const idx = board.player2Marbles.indexOf(pos.key);
        if (idx !== -1) {
          board.player2Marbles[idx] = newKey;
        }
      }
    });

    // STEP 3: Switch turn
    board.currentPlayer = opponent;

    return board;
  }

  // ===== Get ALL valid moves for a player (AI use) =====
  static getAllValidMoves(board, player) {
    const allMoves = [];
    const marbleKeys = player === 1 ? [...board.player1Marbles] : [...board.player2Marbles];

    const marbles = marbleKeys.map(key => {
      const [q, r, s] = key.split(',').map(Number);
      return { q, r, s };
    });

    // Single marble moves
    for (let i = 0; i < marbles.length; i++) {
      const moves = this.getValidMoves(board, [marbles[i]], player);
      moves.forEach(move => {
        move.id = `1_${i}_${move.direction}`;
        allMoves.push(move);
      });
    }

    // 2 marble moves
    for (let i = 0; i < marbles.length; i++) {
      for (let j = i + 1; j < marbles.length; j++) {
        if (!this.areAdjacent(marbles[i], marbles[j])) continue;

        const pair = [marbles[i], marbles[j]];
        if (!this.areInLine(pair)) continue;

        const moves = this.getValidMoves(board, pair, player);
        moves.forEach(move => {
          move.id = `2_${i}_${j}_${move.direction}`;
          allMoves.push(move);
        });
      }
    }

    // 3 marble moves
    for (let i = 0; i < marbles.length; i++) {
      for (let j = i + 1; j < marbles.length; j++) {
        if (!this.areAdjacent(marbles[i], marbles[j])) continue;

        for (let k = j + 1; k < marbles.length; k++) {
          const trio = [marbles[i], marbles[j], marbles[k]];
          if (!this.areInLine(trio)) continue;

          const sorted = this.sortByPosition(trio);
          if (!this.areAdjacent(sorted[0], sorted[1])) continue;
          if (!this.areAdjacent(sorted[1], sorted[2])) continue;

          const moves = this.getValidMoves(board, trio, player);
          moves.forEach(move => {
            move.id = `3_${i}_${j}_${k}_${move.direction}`;
            allMoves.push(move);
          });
        }
      }
    }

    return allMoves;
  }

  // Check adjacency
  static areAdjacent(a, b) {
    const dq = Math.abs(a.q - b.q);
    const dr = Math.abs(a.r - b.r);
    const ds = Math.abs(a.s - b.s);
    return dq <= 1 && dr <= 1 && ds <= 1 && (dq + dr + ds) === 2;
  }

  // Sort by position
  static sortByPosition(marbles) {
    return [...marbles].sort((a, b) => {
      if (a.q !== b.q) return a.q - b.q;
      if (a.r !== b.r) return a.r - b.r;
      return a.s - b.s;
    });
  }

  // Check win
  static checkWin(board) {
    if (board.player1Score >= board.winScore) return 1;
    if (board.player2Score >= board.winScore) return 2;
    return null;
  }
}

export default MoveEngine;