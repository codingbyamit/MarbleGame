// src/components/GameBoard.js
import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import HexUtils from '../utils/HexUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = SCREEN_WIDTH - 30;
const CENTER_X = BOARD_SIZE / 2;
const CENTER_Y = BOARD_SIZE / 2;
const MARBLE_SIZE = 32;
const CELL_SIZE = 36;

function GameBoard({
  board,
  selectedMarbles = [],
  highlightCells = [],
  onCellPress,
  disabled = false,
}) {
  // Generate all cell positions
  const cellPositions = useMemo(() => {
    const positions = [];
    Object.keys(board.cells).forEach((key) => {
      const cell = board.cells[key];
      const pixel = HexUtils.hexToPixel(cell.q, cell.r, cell.s);
      positions.push({
        key,
        q: cell.q,
        r: cell.r,
        s: cell.s,
        x: CENTER_X + pixel.x,
        y: CENTER_Y + pixel.y,
        marble: cell.marble,
      });
    });
    return positions;
  }, [board]);

  const isSelected = (q, r, s) => {
    return selectedMarbles.some(
      (m) => m.q === q && m.r === r && m.s === s
    );
  };

  const isHighlighted = (q, r, s) => {
    return highlightCells.some(
      (h) => h.q === q && h.r === r && h.s === s
    );
  };

  return (
    <View style={styles.boardContainer}>
      <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
        {cellPositions.map((cell) => {
          const selected = isSelected(cell.q, cell.r, cell.s);
          const highlighted = isHighlighted(cell.q, cell.r, cell.s);

          return (
            <TouchableOpacity
              key={cell.key}
              style={[
                styles.cell,
                {
                  left: cell.x - CELL_SIZE / 2,
                  top: cell.y - CELL_SIZE / 2,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderRadius: CELL_SIZE / 2,
                  backgroundColor: highlighted
                    ? '#FFD70033'
                    : '#1e1e3a',
                  borderColor: highlighted
                    ? '#FFD700'
                    : '#2a2a4a',
                },
              ]}
              activeOpacity={0.7}
              disabled={disabled}
              onPress={() => onCellPress(cell.q, cell.r, cell.s)}
            >
              {/* Marble */}
              {cell.marble !== null && (
                <View
                  style={[
                    styles.marble,
                    {
                      width: MARBLE_SIZE,
                      height: MARBLE_SIZE,
                      borderRadius: MARBLE_SIZE / 2,
                      backgroundColor:
                        cell.marble === 1 ? '#F0F0F0' : '#2a2a2a',
                      borderColor: selected
                        ? '#FFD700'
                        : cell.marble === 1
                        ? '#DDD'
                        : '#444',
                      borderWidth: selected ? 3 : 2,
                    },
                    selected && styles.selectedMarble,
                  ]}
                >
                  {/* Marble shine effect */}
                  <View
                    style={[
                      styles.shine,
                      {
                        backgroundColor:
                          cell.marble === 1
                            ? 'rgba(255,255,255,0.8)'
                            : 'rgba(255,255,255,0.2)',
                      },
                    ]}
                  />
                </View>
              )}

              {/* Direction arrow for highlighted cells */}
              {highlighted && cell.marble === null && (
                <View style={styles.moveIndicator}>
                  <Text style={styles.moveArrow}>•</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  board: {
    position: 'relative',
    backgroundColor: '#0a0a1a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2a2a4a',
  },
  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  marble: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  selectedMarble: {
    elevation: 10,
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    transform: [{ scale: 1.1 }],
  },
  shine: {
    position: 'absolute',
    top: 3,
    left: 5,
    width: 10,
    height: 8,
    borderRadius: 5,
  },
  moveIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD70066',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveArrow: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default GameBoard;