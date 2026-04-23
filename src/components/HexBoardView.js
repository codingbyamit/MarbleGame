// src/components/HexBoardView.js
import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Canvas, Circle, Path, Group, Text as SkText, 
  useFont, LinearGradient, vec, Shadow } from '@shopify/react-native-skia';
import HexUtils from '../utils/HexUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = SCREEN_WIDTH - 20;
const CENTER_X = BOARD_SIZE / 2;
const CENTER_Y = BOARD_SIZE / 2;

// NOTE: Agar Skia install nahi hai to simple View-based version use karo (neeche hai)

function HexBoardView({
  board,
  selectedMarbles,
  validMoves,
  onCellPress,
  onMoveSelect,
}) {
  const handleTouch = useCallback(
    (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const hex = HexUtils.pixelToHex(
        locationX, locationY, CENTER_X, CENTER_Y
      );

      if (board.isValidPosition(hex.q, hex.r, hex.s)) {
        onCellPress(hex.q, hex.r, hex.s);
      }
    },
    [board, onCellPress]
  );

  // Render cells
  const renderCells = () => {
    const elements = [];

    Object.keys(board.cells).forEach((key) => {
      const cell = board.cells[key];
      const pos = HexUtils.hexToPixel(cell.q, cell.r, cell.s);
      const screenX = CENTER_X + pos.x;
      const screenY = CENTER_Y + pos.y;

      // Check if selected
      const isSelected = selectedMarbles.some(
        (m) => m.q === cell.q && m.r === cell.r && m.s === cell.s
      );

      // Check if valid move destination
      // const isValidDest = validMoves.some((move) => {
      //   const dir = MoveEngine.getDirectionDelta(move.direction);
      //   // Simple check - ye baad mein improve karenge
      //   return false;
      // });
      const isValidDest = validMoves.some((move) => {
  const dir = MoveEngine.getDirectionDelta(move.direction);
  return false;  // ❌ Always false!
});

      elements.push({
        key,
        x: screenX,
        y: screenY,
        marble: cell.marble,
        isSelected,
        isValidDest,
      });
    });

    return elements;
  };

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onResponderRelease={handleTouch}
    >
      {renderCells().map((cell) => (
        <React.Fragment key={cell.key}>
          {/* Hex Cell Background */}
          <View
            style={[
              styles.hexCell,
              {
                left: cell.x - HexUtils.HEX_SIZE + 10,
                top: cell.y - HexUtils.HEX_SIZE + 10,
                width: HexUtils.HEX_SIZE * 2,
                height: HexUtils.HEX_SIZE * 2,
                borderRadius: HexUtils.HEX_SIZE,
                backgroundColor: cell.isSelected
                  ? '#FFD70055'
                  : '#2a2a4a',
                borderColor: cell.isSelected ? '#FFD700' : '#3a3a5a',
              },
            ]}
          />

          {/* Marble */}
          {cell.marble !== null && (
            <View
              style={[
                styles.marble,
                {
                  left: cell.x - HexUtils.HEX_SIZE * 0.7 + 10,
                  top: cell.y - HexUtils.HEX_SIZE * 0.7 + 10,
                  width: HexUtils.HEX_SIZE * 1.4,
                  height: HexUtils.HEX_SIZE * 1.4,
                  borderRadius: HexUtils.HEX_SIZE,
                  backgroundColor:
                    cell.marble === 1 ? '#F5F5F5' : '#333333',
                  borderColor: cell.isSelected
                    ? '#FFD700'
                    : cell.marble === 1
                    ? '#DDD'
                    : '#555',
                  borderWidth: cell.isSelected ? 3 : 2,
                  elevation: cell.isSelected ? 8 : 4,
                },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    position: 'relative',
  },
  hexCell: {
    position: 'absolute',
    borderWidth: 1,
  },
  marble: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});

export default HexBoardView;