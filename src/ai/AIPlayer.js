// src/ai/AIPlayer.js - COMPLETE AI ENGINE

import MoveEngine from '../game/MoveEngine';

class AIPlayer {
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.transpositionTable = {};
  }

  // Main: Get best move for AI
  getBestMove(board) {
    switch (this.difficulty) {
      case 'easy':
        return this.getEasyMove(board);
      case 'medium':
        return this.getMediumMove(board);
      case 'hard':
        return this.getHardMove(board);
      default:
        return this.getEasyMove(board);
    }
  }

  // ===== EASY AI: Random valid move (with slight preference for pushes) =====
  getEasyMove(board) {
    const allMoves = MoveEngine.getAllValidMoves(board, board.currentPlayer);
    if (allMoves.length === 0) return null;

    // 30% chance to pick a push move if available
    if (Math.random() < 0.3) {
      const pushMoves = allMoves.filter(m => m.push > 0);
      if (pushMoves.length > 0) {
        return pushMoves[Math.floor(Math.random() * pushMoves.length)];
      }
    }

    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  // ===== MEDIUM AI: Minimax depth 2 =====
  getMediumMove(board) {
    this.transpositionTable = {};
    const player = board.currentPlayer;
    const allMoves = MoveEngine.getAllValidMoves(board, player);

    if (allMoves.length === 0) return null;

    let bestMove = allMoves[0];
    let bestScore = -Infinity;

    for (const move of allMoves) {
      const newBoard = board.clone();
      MoveEngine.executeMove(newBoard, move);
      const score = this.minimax(newBoard, 2, false, player, -Infinity, Infinity);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // ===== HARD AI: Minimax + Alpha-Beta depth 4 =====
  getHardMove(board) {
    this.transpositionTable = {};
    const player = board.currentPlayer;
    const allMoves = MoveEngine.getAllValidMoves(board, player);

    if (allMoves.length === 0) return null;

    // Sort moves to improve alpha-beta pruning
    const scoredMoves = allMoves.map(move => {
      let priority = 0;
      if (move.pushOff) priority = 100;
      else if (move.push > 0) priority = 50;
      else if (move.marbles.length === 3) priority = 10;
      else if (move.marbles.length === 2) priority = 5;
      return { move, priority };
    });

    scoredMoves.sort((a, b) => b.priority - a.priority);

    let bestMove = scoredMoves[0].move;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    for (const { move } of scoredMoves) {
      const newBoard = board.clone();
      MoveEngine.executeMove(newBoard, move);
      const score = this.minimax(newBoard, 4, false, player, alpha, beta);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
  }

  // ===== MINIMAX with Alpha-Beta Pruning =====
  minimax(board, depth, isMaximizing, aiPlayer, alpha, beta) {
    // Check terminal states
    const winner = MoveEngine.checkWin(board);
    if (winner === aiPlayer) return 10000 + depth;
    if (winner !== null) return -10000 - depth;
    if (depth === 0) return this.evaluateBoard(board, aiPlayer);

    const currentPlayer = board.currentPlayer;
    const allMoves = MoveEngine.getAllValidMoves(board, currentPlayer);

    if (allMoves.length === 0) return 0;

    // Limit moves for performance
    const movesToCheck = allMoves.slice(0, Math.min(allMoves.length, 20));

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (const move of movesToCheck) {
        const newBoard = board.clone();
        MoveEngine.executeMove(newBoard, move);
        const score = this.minimax(newBoard, depth - 1, false, aiPlayer, alpha, beta);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Prune!
      }

      return maxScore;
    } else {
      let minScore = Infinity;

      for (const move of movesToCheck) {
        const newBoard = board.clone();
        MoveEngine.executeMove(newBoard, move);
        const score = this.minimax(newBoard, depth - 1, true, aiPlayer, alpha, beta);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Prune!
      }

      return minScore;
    }
  }

  // ===== Board Evaluation Function =====
  evaluateBoard(board, aiPlayer) {
    const opponent = aiPlayer === 1 ? 2 : 1;
    let score = 0;

    // 1. Score difference (most important)
    const aiScore = aiPlayer === 1 ? board.player1Score : board.player2Score;
    const oppScore = aiPlayer === 1 ? board.player2Score : board.player1Score;
    score += (aiScore - oppScore) * 500;

    // 2. Marble count advantage
    const aiMarbles = aiPlayer === 1 ? board.player1Marbles.length : board.player2Marbles.length;
    const oppMarbles = aiPlayer === 1 ? board.player2Marbles.length : board.player1Marbles.length;
    score += (aiMarbles - oppMarbles) * 100;

    // 3. Center control (marbles near center are stronger)
    const aiCenterScore = this.calculateCenterControl(board, aiPlayer);
    const oppCenterScore = this.calculateCenterControl(board, opponent);
    score += (aiCenterScore - oppCenterScore) * 30;

    // 4. Cohesion (marbles close together are stronger)
    const aiCohesion = this.calculateCohesion(board, aiPlayer);
    const oppCohesion = this.calculateCohesion(board, opponent);
    score += (aiCohesion - oppCohesion) * 15;

    // 5. Edge danger (opponent marbles near edge = good for us)
    const oppEdgeDanger = this.calculateEdgeDanger(board, opponent);
    const aiEdgeDanger = this.calculateEdgeDanger(board, aiPlayer);
    score += (oppEdgeDanger - aiEdgeDanger) * 40;

    // 6. Push potential
    const aiPushMoves = this.countPushMoves(board, aiPlayer);
    const oppPushMoves = this.countPushMoves(board, opponent);
    score += (aiPushMoves - oppPushMoves) * 20;

    return score;
  }

  // Center control score
  calculateCenterControl(board, player) {
    const marbleKeys = player === 1 ? board.player1Marbles : board.player2Marbles;
    let totalScore = 0;

    marbleKeys.forEach(key => {
      const [q, r, s] = key.split(',').map(Number);
      // Distance from center (0,0,0)
      const distance = (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
      // Closer to center = higher score (max distance is 4)
      totalScore += (4 - distance);
    });

    return totalScore;
  }

  // Cohesion score (how close marbles are to each other)
  calculateCohesion(board, player) {
    const marbleKeys = player === 1 ? board.player1Marbles : board.player2Marbles;
    let adjacentPairs = 0;

    for (let i = 0; i < marbleKeys.length; i++) {
      const [q1, r1, s1] = marbleKeys[i].split(',').map(Number);
      for (let j = i + 1; j < marbleKeys.length; j++) {
        const [q2, r2, s2] = marbleKeys[j].split(',').map(Number);
        if (MoveEngine.areAdjacent(
          { q: q1, r: r1, s: s1 },
          { q: q2, r: r2, s: s2 }
        )) {
          adjacentPairs++;
        }
      }
    }

    return adjacentPairs;
  }

  // Edge danger (marbles on edge of board)
  calculateEdgeDanger(board, player) {
    const marbleKeys = player === 1 ? board.player1Marbles : board.player2Marbles;
    let edgeCount = 0;

    marbleKeys.forEach(key => {
      const [q, r, s] = key.split(',').map(Number);
      const distance = (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
      if (distance >= 3) edgeCount += 1;
      if (distance >= 4) edgeCount += 2; // Extra danger on very edge
    });

    return edgeCount;
  }

  // Count available push moves
  countPushMoves(board, player) {
    try {
      const allMoves = MoveEngine.getAllValidMoves(board, player);
      return allMoves.filter(m => m.push > 0).length;
    } catch (e) {
      return 0;
    }
  }
}

export default AIPlayer;