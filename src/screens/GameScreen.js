// // src/screens/GameScreen.js - COMPLETE REPLACEMENT
// import React, {useState, useCallback, useEffect, useRef} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Dimensions,
//   ActivityIndicator,
//   Animated,
// } from 'react-native';
// import HexBoard from '../game/HexBoard';
// import MoveEngine from '../game/MoveEngine';
// import GameBoard from '../components/GameBoard';
// import AIPlayer from '../ai/AIPlayer';
// import soundManager from '../utils/SoundManager';

// const {width: SCREEN_WIDTH} = Dimensions.get('window');

// function GameScreen({route, navigation}) {
//   const {mode, difficulty} = route.params;

//   // Game State
//   const [board, setBoard] = useState(() => new HexBoard());
//   const [selectedMarbles, setSelectedMarbles] = useState([]);
//   const [validMoves, setValidMoves] = useState([]);
//   const [highlightCells, setHighlightCells] = useState([]);
//   const [gameOver, setGameOver] = useState(false);
//   const [message, setMessage] = useState('');
//   const [aiThinking, setAiThinking] = useState(false);
//   const [lastPushOff, setLastPushOff] = useState(false);

//   // AI ref
//   const aiRef = useRef(
//     mode === 'ai' ? new AIPlayer(difficulty || 'easy') : null,
//   );

//   // Animations
//   const pushAnim = useRef(new Animated.Value(0)).current;
//   const scoreAnim = useRef(new Animated.Value(1)).current;

//   const currentPlayer = board.currentPlayer;
//   const isAITurn = mode === 'ai' && currentPlayer === 2 && !gameOver;

//   // Push off animation
//   useEffect(() => {
//     if (lastPushOff) {
//       Animated.sequence([
//         Animated.timing(scoreAnim, {
//           toValue: 1.3,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scoreAnim, {
//           toValue: 1,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start();
//       setLastPushOff(false);
//     }
//   }, [lastPushOff]);

//   // Update message
//   useEffect(() => {
//     if (gameOver) return;
//     if (aiThinking) {
//       setMessage('🤖 AI is thinking...');
//       return;
//     }

//     const playerIcon = currentPlayer === 1 ? '⚪' : '⚫';
//     const playerName =
//       currentPlayer === 1 ? 'Player 1' : mode === 'ai' ? 'AI' : 'Player 2';

//     if (selectedMarbles.length === 0) {
//       setMessage(`${playerIcon} ${playerName}'s turn - Select marble(s)`);
//     } else {
//       setMessage(
//         `${selectedMarbles.length} marble(s) selected - Choose direction`,
//       );
//     }
//   }, [selectedMarbles, currentPlayer, gameOver, aiThinking]);

//   // Check win
//   useEffect(() => {
//     const winner = MoveEngine.checkWin(board);
//     if (winner) {
//       setGameOver(true);
//       soundManager.play('win'); // ⭐ ADD
//       const winnerName =
//         winner === 1 ? 'Player 1' : mode === 'ai' ? 'AI' : 'Player 2';
//       setMessage(`🏆 ${winnerName} Wins!`);

//       setTimeout(() => {
//         Alert.alert(
//           '🏆 Game Over!',
//           `${winnerName} wins by pushing 6 marbles off the board!`,
//           [
//             {text: '🔄 New Game', onPress: resetGame},
//             {text: '🏠 Menu', onPress: () => navigation.goBack()},
//           ],
//         );
//       }, 500);
//     }
//   }, [board]);

//   // ===== AI TURN =====
//   useEffect(() => {
//     if (!isAITurn || gameOver) return;

//     setAiThinking(true);

//     const timer = setTimeout(
//       () => {
//         try {
//           const ai = aiRef.current;
//           const move = ai.getBestMove(board);

//           if (move) {
//             const newBoard = board.clone();
//             MoveEngine.executeMove(newBoard, move);

//             setBoard(newBoard);
//             setSelectedMarbles([]);
//             setValidMoves([]);
//             setHighlightCells([]);

//             // if (move.pushOff) {
//             //   setLastPushOff(true);
//             //   setMessage('💥 AI pushed your marble off!');
//             // }
//             if (move.pushOff) {
//               soundManager.play('pushOff'); // ⭐ ADD
//               setLastPushOff(true);
//               setMessage('💥 AI pushed your marble off!');
//             } else if (move.push > 0) {
//               soundManager.play('push'); // ⭐ ADD
//             } else {
//               soundManager.play('move'); // ⭐ ADD
//             }
//           }
//         } catch (error) {
//           console.log('AI Error:', error);
//           // Fallback to random move
//           const allMoves = MoveEngine.getAllValidMoves(board, 2);
//           if (allMoves.length > 0) {
//             const randomMove =
//               allMoves[Math.floor(Math.random() * allMoves.length)];
//             const newBoard = board.clone();
//             MoveEngine.executeMove(newBoard, randomMove);
//             setBoard(newBoard);
//             setSelectedMarbles([]);
//             setValidMoves([]);
//             setHighlightCells([]);
//           }
//         }

//         setAiThinking(false);
//       },
//       difficulty === 'hard' ? 1500 : difficulty === 'medium' ? 1000 : 600,
//     );

//     return () => clearTimeout(timer);
//   }, [isAITurn, board, gameOver]);

//   // ===== CELL PRESS HANDLER =====
//   const onCellPress = useCallback(
//     (q, r, s) => {
//       if (gameOver || isAITurn || aiThinking) return;

//       const cell = board.getCell(q, r, s);
//       if (!cell) return;

//       const marbleCoord = {q, r, s};

//       // CLICKING OWN MARBLE - Select/Deselect
//       if (cell.marble === currentPlayer) {
//         const alreadyIdx = selectedMarbles.findIndex(
//           m => m.q === q && m.r === r && m.s === s,
//         );

//         let newSelected;
//         if (alreadyIdx !== -1) {
//           // Deselect
//           newSelected = selectedMarbles.filter((_, i) => i !== alreadyIdx);
//         } else if (selectedMarbles.length < 3) {
//           newSelected = [...selectedMarbles, marbleCoord];

//           // Validate: must be in line and adjacent
//           if (newSelected.length > 1) {
//             if (!MoveEngine.areInLine(newSelected)) {
//               setMessage('❌ Marbles must be in a straight line!');
//               return;
//             }
//             const sorted = MoveEngine.sortByPosition(newSelected);
//             for (let i = 0; i < sorted.length - 1; i++) {
//               if (!MoveEngine.areAdjacent(sorted[i], sorted[i + 1])) {
//                 setMessage('❌ Marbles must be next to each other!');
//                 return;
//               }
//             }
//           }
//         } else {
//           setMessage('⚠️ Maximum 3 marbles can be selected!');
//           return;
//         }

//         setSelectedMarbles(newSelected);
//         updateValidMoves(newSelected);
//         soundManager.play('click'); // ⭐ ADD
//         return;
//       }

//       // CLICKING EMPTY/OPPONENT CELL - Try to move
//       if (selectedMarbles.length > 0 && validMoves.length > 0) {
//         // Find matching move
//         for (const move of validMoves) {
//           const dir = MoveEngine.getDirectionDelta(move.direction);
//           if (!dir) continue;

//           // Check if click matches any marble's destination
//           let matches = false;

//           if (move.type === 'inline') {
//             // For inline, check front marble's destination
//             const front = MoveEngine.getFrontMarble(
//               selectedMarbles,
//               move.direction,
//             );
//             const destQ = front.q + dir[0];
//             const destR = front.r + dir[1];
//             const destS = front.s + dir[2];
//             if (destQ === q && destR === r && destS === s) {
//               matches = true;
//             }
//           } else {
//             // For broadside, check any marble's destination
//             matches = selectedMarbles.some(m => {
//               return (
//                 m.q + dir[0] === q && m.r + dir[1] === r && m.s + dir[2] === s
//               );
//             });
//           }

//           if (matches) {
//             executeMove(move);
//             return;
//           }
//         }
//       }

//       // Clicking nothing useful - clear selection
//       if (cell.marble === null && selectedMarbles.length === 0) {
//         setSelectedMarbles([]);
//         setValidMoves([]);
//         setHighlightCells([]);
//       }
//     },
//     [
//       board,
//       selectedMarbles,
//       validMoves,
//       currentPlayer,
//       gameOver,
//       isAITurn,
//       aiThinking,
//     ],
//   );

//   // Update valid moves and highlights
//   const updateValidMoves = useCallback(
//     selected => {
//       if (selected.length === 0) {
//         setValidMoves([]);
//         setHighlightCells([]);
//         return;
//       }

//       const moves = MoveEngine.getValidMoves(board, selected, currentPlayer);
//       setValidMoves(moves);

//       // Calculate highlight cells
//       const highlights = [];
//       const highlightSet = new Set();

//       moves.forEach(move => {
//         const dir = MoveEngine.getDirectionDelta(move.direction);
//         if (!dir) return;

//         if (move.type === 'inline') {
//           const front = MoveEngine.getFrontMarble(selected, move.direction);
//           const hq = front.q + dir[0];
//           const hr = front.r + dir[1];
//           const hs = front.s + dir[2];
//           const hKey = `${hq},${hr},${hs}`;
//           if (!highlightSet.has(hKey) && board.isValidPosition(hq, hr, hs)) {
//             highlightSet.add(hKey);
//             highlights.push({
//               q: hq,
//               r: hr,
//               s: hs,
//               isPush: move.push > 0,
//               isPushOff: move.pushOff,
//             });
//           }
//         } else {
//           selected.forEach(m => {
//             const hq = m.q + dir[0];
//             const hr = m.r + dir[1];
//             const hs = m.s + dir[2];
//             const hKey = `${hq},${hr},${hs}`;
//             if (!highlightSet.has(hKey) && board.isValidPosition(hq, hr, hs)) {
//               const isOwnMarble = selected.some(
//                 sm => sm.q === hq && sm.r === hr && sm.s === hs,
//               );
//               if (!isOwnMarble) {
//                 highlightSet.add(hKey);
//                 highlights.push({
//                   q: hq,
//                   r: hr,
//                   s: hs,
//                   isPush: false,
//                   isPushOff: false,
//                 });
//               }
//             }
//           });
//         }
//       });

//       setHighlightCells(highlights);
//     },
//     [board, currentPlayer],
//   );

//   // Execute move
//   const executeMove = useCallback(
//     move => {
//       const newBoard = board.clone();
//       MoveEngine.executeMove(newBoard, move);

//       setBoard(newBoard);
//       setSelectedMarbles([]);
//       setValidMoves([]);
//       setHighlightCells([]);

//       // if (move.pushOff) {
//       //   setLastPushOff(true);
//       //   setMessage('💥 Marble pushed off the board!');
//       // } else if (move.push > 0) {
//       //   setMessage('👊 Marble pushed!');
//       // }
//       // ⭐ ADD: Play appropriate sound
//       if (move.pushOff) {
//         soundManager.play('pushOff');
//         setLastPushOff(true);
//         setMessage('💥 Marble pushed off the board!');
//       } else if (move.push > 0) {
//         soundManager.play('push');
//         setMessage('👊 Marble pushed!');
//       } else {
//         soundManager.play('move');
//       }
//     },
//     [board],
//   );

//   // Reset
//   const resetGame = () => {
//     setBoard(new HexBoard());
//     setSelectedMarbles([]);
//     setValidMoves([]);
//     setHighlightCells([]);
//     setGameOver(false);
//     setAiThinking(false);
//     setLastPushOff(false);
//     if (aiRef.current) {
//       aiRef.current.transpositionTable = {};
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.headerBtn}
//           onPress={() => navigation.goBack()}>
//           <Text style={styles.headerBtnText}>← Back</Text>
//         </TouchableOpacity>

//         <Text style={styles.modeText}>
//           {mode === 'ai' ? `🤖 vs AI (${difficulty})` : '👥 2 Player'}
//         </Text>

//         <TouchableOpacity style={styles.headerBtn} onPress={resetGame}>
//           <Text style={styles.headerBtnText}>🔄 New</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Score Board */}
//       <View style={styles.scoreRow}>
//         <Animated.View
//           style={[
//             styles.scoreCard,
//             currentPlayer === 1 && styles.activeScoreCard,
//             currentPlayer === 1 && {transform: [{scale: scoreAnim}]},
//           ]}>
//           <View style={[styles.marbleIcon, {backgroundColor: '#F0F0F0'}]} />
//           <Text style={styles.playerLabel}>
//             {currentPlayer === 1 ? '▶ ' : ''}Player 1
//           </Text>
//           <Text style={styles.scoreValue}>{board.player1Score}</Text>
//           <Text style={styles.scoreMax}>/ 6</Text>
//         </Animated.View>

//         <View style={styles.turnIndicator}>
//           <Text style={styles.turnEmoji}>
//             {aiThinking ? '🤔' : currentPlayer === 1 ? '⚪' : '⚫'}
//           </Text>
//           <Text style={styles.turnLabel}>
//             {aiThinking ? 'Thinking' : 'Turn'}
//           </Text>
//         </View>

//         <Animated.View
//           style={[
//             styles.scoreCard,
//             currentPlayer === 2 && styles.activeScoreCard,
//             currentPlayer === 2 && {transform: [{scale: scoreAnim}]},
//           ]}>
//           <View style={[styles.marbleIcon, {backgroundColor: '#333'}]} />
//           <Text style={styles.playerLabel}>
//             {currentPlayer === 2 ? '▶ ' : ''}
//             {mode === 'ai' ? 'AI' : 'Player 2'}
//           </Text>
//           <Text style={styles.scoreValue}>{board.player2Score}</Text>
//           <Text style={styles.scoreMax}>/ 6</Text>
//         </Animated.View>
//       </View>

//       {/* Game Board */}
//       <View style={styles.boardWrapper}>
//         {aiThinking && (
//           <View style={styles.thinkingOverlay}>
//             <ActivityIndicator size="large" color="#FFD700" />
//           </View>
//         )}
//         <GameBoard
//           board={board}
//           selectedMarbles={selectedMarbles}
//           highlightCells={highlightCells}
//           onCellPress={onCellPress}
//           disabled={isAITurn || gameOver || aiThinking}
//         />
//       </View>

//       {/* Message Bar */}
//       <View
//         style={[
//           styles.messageBar,
//           lastPushOff && styles.messageBarAlert,
//           gameOver && styles.messageBarWin,
//         ]}>
//         <Text style={styles.messageText}>{message}</Text>
//       </View>

//       {/* Controls */}
//       <View style={styles.controls}>
//         {selectedMarbles.length > 0 && !aiThinking && (
//           <TouchableOpacity
//             style={styles.clearBtn}
//             onPress={() => {
//               setSelectedMarbles([]);
//               setValidMoves([]);
//               setHighlightCells([]);
//             }}>
//             <Text style={styles.clearBtnText}>✕ Clear</Text>
//           </TouchableOpacity>
//         )}

//         {validMoves.length > 0 && !aiThinking && (
//           <Text style={styles.movesInfo}>
//             {validMoves.length} move{validMoves.length > 1 ? 's' : ''} •{' '}
//             {validMoves.filter(m => m.push > 0).length} push
//           </Text>
//         )}
//       </View>

//       {/* Direction Buttons */}
//       {selectedMarbles.length > 0 && validMoves.length > 0 && !aiThinking && (
//         <View style={styles.dirContainer}>
//           <View style={styles.dirRow}>
//             {validMoves.map((move, idx) => (
//               <TouchableOpacity
//                 key={idx}
//                 style={[
//                   styles.dirBtn,
//                   move.pushOff && styles.dirBtnDanger,
//                   move.push > 0 && !move.pushOff && styles.dirBtnPush,
//                 ]}
//                 onPress={() => executeMove(move)}
//                 activeOpacity={0.7}>
//                 <Text style={styles.dirArrow}>
//                   {getDirEmoji(move.direction)}
//                 </Text>
//                 <Text style={styles.dirLabel}>
//                   {move.push > 0
//                     ? move.pushOff
//                       ? `💥 Push Off!`
//                       : `👊 Push ${move.push}`
//                     : getDirName(move.direction)}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// function getDirEmoji(dir) {
//   const e = {
//     right: '➡️',
//     topRight: '↗️',
//     topLeft: '↖️',
//     left: '⬅️',
//     bottomLeft: '↙️',
//     bottomRight: '↘️',
//   };
//   return e[dir] || '•';
// }

// function getDirName(dir) {
//   const n = {
//     right: 'Right',
//     topRight: 'Top-R',
//     topLeft: 'Top-L',
//     left: 'Left',
//     bottomLeft: 'Bot-L',
//     bottomRight: 'Bot-R',
//   };
//   return n[dir] || dir;
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0d0d1a',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//     paddingTop: 42,
//     paddingBottom: 8,
//     backgroundColor: '#111128',
//     borderBottomWidth: 1,
//     borderBottomColor: '#222',
//   },
//   headerBtn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//   },
//   headerBtnText: {
//     color: '#FFD700',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   modeText: {
//     color: '#FFF',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   scoreRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//   },
//   scoreCard: {
//     flex: 1,
//     backgroundColor: '#151530',
//     borderRadius: 14,
//     paddingVertical: 10,
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#252550',
//   },
//   activeScoreCard: {
//     borderColor: '#FFD700',
//     backgroundColor: '#1a1a40',
//   },
//   marbleIcon: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     marginBottom: 4,
//     borderWidth: 1,
//     borderColor: '#555',
//   },
//   playerLabel: {
//     color: '#AAA',
//     fontSize: 11,
//     fontWeight: '600',
//   },
//   scoreValue: {
//     color: '#FFD700',
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginTop: 2,
//   },
//   scoreMax: {
//     color: '#555',
//     fontSize: 12,
//   },
//   turnIndicator: {
//     alignItems: 'center',
//     paddingHorizontal: 15,
//   },
//   turnEmoji: {
//     fontSize: 28,
//   },
//   turnLabel: {
//     color: '#666',
//     fontSize: 10,
//     marginTop: 2,
//   },
//   boardWrapper: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//   },
//   thinkingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//   },
//   messageBar: {
//     backgroundColor: '#1a1a30',
//     marginHorizontal: 15,
//     marginTop: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#252550',
//   },
//   messageBarAlert: {
//     backgroundColor: '#2a1a0a',
//     borderColor: '#FF6600',
//   },
//   messageBarWin: {
//     backgroundColor: '#1a2a0a',
//     borderColor: '#66FF00',
//   },
//   messageText: {
//     color: '#FFF',
//     fontSize: 13,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   controls: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 8,
//     paddingHorizontal: 20,
//     gap: 15,
//   },
//   clearBtn: {
//     backgroundColor: '#2a2a40',
//     paddingVertical: 7,
//     paddingHorizontal: 18,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#444',
//   },
//   clearBtnText: {
//     color: '#FFF',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   movesInfo: {
//     color: '#FFD700',
//     fontSize: 12,
//   },
//   dirContainer: {
//     paddingHorizontal: 10,
//     paddingTop: 8,
//     paddingBottom: 15,
//   },
//   dirRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     gap: 6,
//   },
//   dirBtn: {
//     backgroundColor: '#1a1a35',
//     borderWidth: 1.5,
//     borderColor: '#FFD700',
//     borderRadius: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     alignItems: 'center',
//     minWidth: 75,
//   },
//   dirBtnPush: {
//     borderColor: '#FF9800',
//     backgroundColor: '#251a0a',
//   },
//   dirBtnDanger: {
//     borderColor: '#FF4444',
//     backgroundColor: '#2a0a0a',
//   },
//   dirArrow: {
//     fontSize: 18,
//   },
//   dirLabel: {
//     color: '#CCC',
//     fontSize: 9,
//     marginTop: 2,
//     textAlign: 'center',
//   },
// });

// export default GameScreen;

// src/screens/GameScreen.js - COMPLETE REPLACEMENT WITH 3D SUPPORT
// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Dimensions,
//   ActivityIndicator,
//   Animated,
//   Switch,
// } from 'react-native';
// import HexBoard from '../game/HexBoard';
// import MoveEngine from '../game/MoveEngine';
// import GameBoard from '../components/GameBoard';
// import GameBoard3D from '../components/GameBoard3D';
// import AIPlayer from '../ai/AIPlayer';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// function GameScreen({ route, navigation }) {
//   const { mode, difficulty } = route.params;

//   // Game State
//   const [board, setBoard] = useState(() => new HexBoard());
//   const [selectedMarbles, setSelectedMarbles] = useState([]);
//   const [validMoves, setValidMoves] = useState([]);
//   const [highlightCells, setHighlightCells] = useState([]);
//   const [gameOver, setGameOver] = useState(false);
//   const [message, setMessage] = useState('');
//   const [aiThinking, setAiThinking] = useState(false);
//   const [lastPushOff, setLastPushOff] = useState(false);
//   const [is3D, setIs3D] = useState(true); // 3D by default!

//   // AI ref
//   const aiRef = useRef(
//     mode === 'ai' ? new AIPlayer(difficulty || 'easy') : null
//   );

//   // Animations
//   const scoreAnim = useRef(new Animated.Value(1)).current;

//   const currentPlayer = board.currentPlayer;
//   const isAITurn = mode === 'ai' && currentPlayer === 2 && !gameOver;

//   // Push off animation
//   useEffect(() => {
//     if (lastPushOff) {
//       Animated.sequence([
//         Animated.timing(scoreAnim, {
//           toValue: 1.3, duration: 200, useNativeDriver: true,
//         }),
//         Animated.timing(scoreAnim, {
//           toValue: 1, duration: 200, useNativeDriver: true,
//         }),
//       ]).start();
//       setTimeout(() => setLastPushOff(false), 500);
//     }
//   }, [lastPushOff]);

//   // Message update
//   useEffect(() => {
//     if (gameOver) return;
//     if (aiThinking) { setMessage('🤖 AI is thinking...'); return; }

//     const icon = currentPlayer === 1 ? '⚪' : '⚫';
//     const name = currentPlayer === 1 ? 'Player 1' :
//       (mode === 'ai' ? 'AI' : 'Player 2');

//     if (selectedMarbles.length === 0) {
//       setMessage(`${icon} ${name}'s turn - Select marble(s)`);
//     } else {
//       setMessage(`${selectedMarbles.length} selected - Choose direction`);
//     }
//   }, [selectedMarbles, currentPlayer, gameOver, aiThinking]);

//   // Check win
//   useEffect(() => {
//     const winner = MoveEngine.checkWin(board);
//     if (winner) {
//       setGameOver(true);
//       const name = winner === 1 ? 'Player 1' :
//         (mode === 'ai' ? 'AI' : 'Player 2');
//       setMessage(`🏆 ${name} Wins!`);
//       setTimeout(() => {
//         Alert.alert('🏆 Game Over!',
//           `${name} wins by pushing 6 marbles off!`,
//           [
//             { text: '🔄 New Game', onPress: resetGame },
//             { text: '🏠 Menu', onPress: () => navigation.goBack() },
//           ]
//         );
//       }, 500);
//     }
//   }, [board]);

//   // AI Turn
//   useEffect(() => {
//     if (!isAITurn || gameOver) return;
//     setAiThinking(true);

//     const delay = difficulty === 'hard' ? 1500 :
//       difficulty === 'medium' ? 1000 : 600;

//     const timer = setTimeout(() => {
//       try {
//         const move = aiRef.current.getBestMove(board);
//         if (move) {
//           const newBoard = board.clone();
//           MoveEngine.executeMove(newBoard, move);
//           setBoard(newBoard);
//           setSelectedMarbles([]);
//           setValidMoves([]);
//           setHighlightCells([]);
//           if (move.pushOff) {
//             setLastPushOff(true);
//             setMessage('💥 AI pushed your marble off!');
//           }
//         }
//       } catch (e) {
//         console.log('AI Error:', e);
//         const allMoves = MoveEngine.getAllValidMoves(board, 2);
//         if (allMoves.length > 0) {
//           const m = allMoves[Math.floor(Math.random() * allMoves.length)];
//           const nb = board.clone();
//           MoveEngine.executeMove(nb, m);
//           setBoard(nb);
//         }
//       }
//       setAiThinking(false);
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [isAITurn, board, gameOver]);

//   // Cell press handler
//   const onCellPress = useCallback((q, r, s) => {
//     if (gameOver || isAITurn || aiThinking) return;

//     const cell = board.getCell(q, r, s);
//     if (!cell) return;

//     // Selecting own marble
//     if (cell.marble === currentPlayer) {
//       const alreadyIdx = selectedMarbles.findIndex(
//         m => m.q === q && m.r === r && m.s === s
//       );

//       let newSelected;
//       if (alreadyIdx !== -1) {
//         newSelected = selectedMarbles.filter((_, i) => i !== alreadyIdx);
//       } else if (selectedMarbles.length < 3) {
//         newSelected = [...selectedMarbles, { q, r, s }];

//         if (newSelected.length > 1) {
//           if (!MoveEngine.areInLine(newSelected)) {
//             setMessage('❌ Must be in a straight line!');
//             return;
//           }
//           const sorted = MoveEngine.sortByPosition(newSelected);
//           for (let i = 0; i < sorted.length - 1; i++) {
//             if (!MoveEngine.areAdjacent(sorted[i], sorted[i + 1])) {
//               setMessage('❌ Must be adjacent!');
//               return;
//             }
//           }
//         }
//       } else {
//         setMessage('⚠️ Max 3 marbles!');
//         return;
//       }

//       setSelectedMarbles(newSelected);
//       updateValidMoves(newSelected);
//       return;
//     }

//     // Clicking empty/opponent - try move
//     if (selectedMarbles.length > 0 && validMoves.length > 0) {
//       for (const move of validMoves) {
//         const dir = MoveEngine.getDirectionDelta(move.direction);
//         if (!dir) continue;

//         let matches = false;

//         if (move.type === 'inline') {
//           const front = MoveEngine.getFrontMarble(selectedMarbles, move.direction);
//           if (front.q + dir[0] === q && front.r + dir[1] === r && front.s + dir[2] === s) {
//             matches = true;
//           }
//         } else {
//           matches = selectedMarbles.some(m =>
//             (m.q + dir[0]) === q && (m.r + dir[1]) === r && (m.s + dir[2]) === s
//           );
//         }

//         if (matches) {
//           executeMove(move);
//           return;
//         }
//       }
//     }

//     if (cell.marble === null && selectedMarbles.length === 0) {
//       setSelectedMarbles([]);
//       setValidMoves([]);
//       setHighlightCells([]);
//     }
//   }, [board, selectedMarbles, validMoves, currentPlayer, gameOver, isAITurn, aiThinking]);

//   // Update valid moves
//   const updateValidMoves = useCallback((selected) => {
//     if (selected.length === 0) {
//       setValidMoves([]);
//       setHighlightCells([]);
//       return;
//     }

//     const moves = MoveEngine.getValidMoves(board, selected, currentPlayer);
//     setValidMoves(moves);

//     const highlights = [];
//     const set = new Set();

//     moves.forEach(move => {
//       const dir = MoveEngine.getDirectionDelta(move.direction);
//       if (!dir) return;

//       if (move.type === 'inline') {
//         const front = MoveEngine.getFrontMarble(selected, move.direction);
//         const hq = front.q + dir[0];
//         const hr = front.r + dir[1];
//         const hs = front.s + dir[2];
//         const k = `${hq},${hr},${hs}`;
//         if (!set.has(k) && board.isValidPosition(hq, hr, hs)) {
//           set.add(k);
//           highlights.push({ q: hq, r: hr, s: hs, isPush: move.push > 0, isPushOff: move.pushOff });
//         }
//       } else {
//         selected.forEach(m => {
//           const hq = m.q + dir[0];
//           const hr = m.r + dir[1];
//           const hs = m.s + dir[2];
//           const k = `${hq},${hr},${hs}`;
//           if (!set.has(k) && board.isValidPosition(hq, hr, hs)) {
//             const isOwn = selected.some(sm => sm.q === hq && sm.r === hr && sm.s === hs);
//             if (!isOwn) {
//               set.add(k);
//               highlights.push({ q: hq, r: hr, s: hs, isPush: false, isPushOff: false });
//             }
//           }
//         });
//       }
//     });

//     setHighlightCells(highlights);
//   }, [board, currentPlayer]);

//   // Execute move
//   const executeMove = useCallback((move) => {
//     const newBoard = board.clone();
//     MoveEngine.executeMove(newBoard, move);
//     setBoard(newBoard);
//     setSelectedMarbles([]);
//     setValidMoves([]);
//     setHighlightCells([]);

//     if (move.pushOff) {
//       setLastPushOff(true);
//       setMessage('💥 Marble pushed off!');
//     } else if (move.push > 0) {
//       setMessage('👊 Pushed!');
//     }
//   }, [board]);

//   // Reset
//   const resetGame = () => {
//     setBoard(new HexBoard());
//     setSelectedMarbles([]);
//     setValidMoves([]);
//     setHighlightCells([]);
//     setGameOver(false);
//     setAiThinking(false);
//     setLastPushOff(false);
//   };

//   // ===== RENDER =====
//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
//           <Text style={styles.hBtnText}>←</Text>
//         </TouchableOpacity>

//         <Text style={styles.modeText}>
//           {mode === 'ai' ? `🤖 AI (${difficulty})` : '👥 2P'}
//         </Text>

//         {/* 3D/2D Toggle */}
//         <View style={styles.toggleRow}>
//           <Text style={styles.toggleLabel}>{is3D ? '3D' : '2D'}</Text>
//           <Switch
//             value={is3D}
//             onValueChange={setIs3D}
//             trackColor={{ false: '#444', true: '#FFD700' }}
//             thumbColor={is3D ? '#FFF' : '#888'}
//           />
//         </View>

//         <TouchableOpacity style={styles.hBtn} onPress={resetGame}>
//           <Text style={styles.hBtnText}>🔄</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Score */}
//       <View style={styles.scoreRow}>
//         <Animated.View style={[
//           styles.scoreCard,
//           currentPlayer === 1 && styles.activeCard,
//           { transform: [{ scale: currentPlayer === 1 ? scoreAnim : 1 }] },
//         ]}>
//           <View style={[styles.dot, { backgroundColor: '#F0F0F0' }]} />
//           <Text style={styles.pName}>{currentPlayer === 1 ? '▶ ' : ''}P1</Text>
//           <Text style={styles.sNum}>{board.player1Score}<Text style={styles.sMax}>/6</Text></Text>
//         </Animated.View>

//         <View style={styles.turnBox}>
//           <Text style={styles.turnE}>{aiThinking ? '🤔' : currentPlayer === 1 ? '⚪' : '⚫'}</Text>
//         </View>

//         <Animated.View style={[
//           styles.scoreCard,
//           currentPlayer === 2 && styles.activeCard,
//           { transform: [{ scale: currentPlayer === 2 ? scoreAnim : 1 }] },
//         ]}>
//           <View style={[styles.dot, { backgroundColor: '#333' }]} />
//           <Text style={styles.pName}>{currentPlayer === 2 ? '▶ ' : ''}{mode === 'ai' ? 'AI' : 'P2'}</Text>
//           <Text style={styles.sNum}>{board.player2Score}<Text style={styles.sMax}>/6</Text></Text>
//         </Animated.View>
//       </View>

//       {/* Board (3D or 2D) */}
//       <View style={styles.boardWrap}>
//         {aiThinking && (
//           <View style={styles.overlay}>
//             <ActivityIndicator size="large" color="#FFD700" />
//             <Text style={styles.overlayText}>AI Thinking...</Text>
//           </View>
//         )}

//         {is3D ? (
//           <GameBoard3D
//             board={board}
//             selectedMarbles={selectedMarbles}
//             highlightCells={highlightCells}
//             onCellPress={onCellPress}
//             disabled={isAITurn || gameOver || aiThinking}
//           />
//         ) : (
//           <GameBoard
//             board={board}
//             selectedMarbles={selectedMarbles}
//             highlightCells={highlightCells}
//             onCellPress={onCellPress}
//             disabled={isAITurn || gameOver || aiThinking}
//           />
//         )}
//       </View>

//       {/* Message */}
//       <View style={[
//         styles.msgBar,
//         lastPushOff && { borderColor: '#FF6600', backgroundColor: '#2a1a0a' },
//         gameOver && { borderColor: '#00FF66', backgroundColor: '#0a2a1a' },
//       ]}>
//         <Text style={styles.msgText}>{message}</Text>
//       </View>

//       {/* Direction Buttons */}
//       {selectedMarbles.length > 0 && validMoves.length > 0 && !aiThinking && (
//         <View style={styles.dirWrap}>
//           <View style={styles.dirRow}>
//             {validMoves.map((move, idx) => (
//               <TouchableOpacity
//                 key={idx}
//                 style={[
//                   styles.dirBtn,
//                   move.pushOff && styles.dirDanger,
//                   move.push > 0 && !move.pushOff && styles.dirPush,
//                 ]}
//                 onPress={() => executeMove(move)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.dirArrow}>{getDirE(move.direction)}</Text>
//                 <Text style={styles.dirLbl}>
//                   {move.pushOff ? '💥OFF' : move.push > 0 ? `👊${move.push}` : getDirN(move.direction)}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <TouchableOpacity style={styles.clrBtn} onPress={() => {
//             setSelectedMarbles([]);
//             setValidMoves([]);
//             setHighlightCells([]);
//           }}>
//             <Text style={styles.clrText}>✕ Clear Selection</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* 3D Camera hint */}
//       {is3D && selectedMarbles.length === 0 && !aiThinking && (
//         <Text style={styles.hint}>👆 Swipe to rotate • Pinch to zoom</Text>
//       )}
//     </View>
//   );
// }

// function getDirE(d) {
//   return { right: '➡️', topRight: '↗️', topLeft: '↖️', left: '⬅️', bottomLeft: '↙️', bottomRight: '↘️' }[d] || '•';
// }
// function getDirN(d) {
//   return { right: 'Right', topRight: 'Top-R', topLeft: 'Top-L', left: 'Left', bottomLeft: 'Bot-L', bottomRight: 'Bot-R' }[d] || d;
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0d0d1a' },
//   header: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     paddingHorizontal: 10, paddingTop: 40, paddingBottom: 6,
//     backgroundColor: '#111128', borderBottomWidth: 1, borderBottomColor: '#222',
//   },
//   hBtn: { padding: 8 },
//   hBtnText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
//   modeText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
//   toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
//   toggleLabel: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
//   scoreRow: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
//     paddingHorizontal: 12, paddingVertical: 8,
//   },
//   scoreCard: {
//     flex: 1, backgroundColor: '#151530', borderRadius: 12, paddingVertical: 8,
//     alignItems: 'center', borderWidth: 2, borderColor: '#252550',
//   },
//   activeCard: { borderColor: '#FFD700', backgroundColor: '#1a1a40' },
//   dot: { width: 16, height: 16, borderRadius: 8, marginBottom: 3, borderWidth: 1, borderColor: '#555' },
//   pName: { color: '#AAA', fontSize: 11, fontWeight: '600' },
//   sNum: { color: '#FFD700', fontSize: 24, fontWeight: 'bold' },
//   sMax: { color: '#555', fontSize: 13, fontWeight: 'normal' },
//   turnBox: { paddingHorizontal: 12 },
//   turnE: { fontSize: 24 },
//   boardWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
//   overlay: {
//     position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
//     alignItems: 'center', justifyContent: 'center',
//     backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 15,
//   },
//   overlayText: { color: '#FFD700', fontSize: 14, marginTop: 8 },
//   msgBar: {
//     backgroundColor: '#1a1a30', marginHorizontal: 12, marginTop: 6,
//     paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
//     alignItems: 'center', borderWidth: 1, borderColor: '#252550',
//   },
//   msgText: { color: '#FFF', fontSize: 12, fontWeight: '500', textAlign: 'center' },
//   dirWrap: { paddingHorizontal: 8, paddingTop: 6, paddingBottom: 10 },
//   dirRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5 },
//   dirBtn: {
//     backgroundColor: '#1a1a35', borderWidth: 1.5, borderColor: '#FFD700',
//     borderRadius: 10, paddingVertical: 6, paddingHorizontal: 8,
//     alignItems: 'center', minWidth: 65,
//   },
//   dirPush: { borderColor: '#FF9800', backgroundColor: '#251a0a' },
//   dirDanger: { borderColor: '#FF4444', backgroundColor: '#2a0a0a' },
//   dirArrow: { fontSize: 16 },
//   dirLbl: { color: '#CCC', fontSize: 8, marginTop: 1 },
//   clrBtn: {
//     alignSelf: 'center', marginTop: 8, backgroundColor: '#2a2a40',
//     paddingVertical: 6, paddingHorizontal: 20, borderRadius: 15,
//   },
//   clrText: { color: '#FFF', fontSize: 11 },
//   hint: { textAlign: 'center', color: '#555', fontSize: 11, paddingVertical: 5 },
// });

// export default GameScreen;


// code 3
// src/screens/GameScreen.js - COMPLETE REPLACEMENT
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import HexBoard from '../game/HexBoard';
import MoveEngine from '../game/MoveEngine';
import GameBoard from '../components/GameBoard';
import AIPlayer from '../ai/AIPlayer';
import soundManager from '../utils/SoundManager';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function GameScreen({ route, navigation }) {
  const { mode, difficulty } = route.params;

  // Game State
  const [board, setBoard] = useState(() => new HexBoard());
  const [selectedMarbles, setSelectedMarbles] = useState([]);
  const [validMoves, setValidMoves] = useState([]);
  const [highlightCells, setHighlightCells] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [lastPushOff, setLastPushOff] = useState(false);

  // AI ref
  const aiRef = useRef(
    mode === 'ai' ? new AIPlayer(difficulty || 'easy') : null
  );

  // Animations
  const pushAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(1)).current;

  const currentPlayer = board.currentPlayer;
  const isAITurn = mode === 'ai' && currentPlayer === 2 && !gameOver;

  // ===== Sound Initialize =====
  useEffect(() => {
    soundManager.init();
    return () => {
      // Screen leave karne par sounds stop karo (release mat karo - reuse hoga)
      soundManager.stopAll();
    };
  }, []);

  // Push off animation
  useEffect(() => {
    if (lastPushOff) {
      Animated.sequence([
        Animated.timing(scoreAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scoreAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setLastPushOff(false);
    }
  }, [lastPushOff]);

  // Update message
  useEffect(() => {
    if (gameOver) return;
    if (aiThinking) {
      setMessage('🤖 AI is thinking...');
      return;
    }

    const playerIcon = currentPlayer === 1 ? '⚪' : '⚫';
    const playerName = currentPlayer === 1 ? 'Player 1' : 
      (mode === 'ai' ? 'AI' : 'Player 2');

    if (selectedMarbles.length === 0) {
      setMessage(`${playerIcon} ${playerName}'s turn - Select marble(s)`);
    } else {
      setMessage(
        `${selectedMarbles.length} marble(s) selected - Choose direction`
      );
    }
  }, [selectedMarbles, currentPlayer, gameOver, aiThinking]);

  // Check win
  useEffect(() => {
    const winner = MoveEngine.checkWin(board);
    if (winner) {
      setGameOver(true);
      const winnerName = winner === 1 ? 'Player 1' : 
        (mode === 'ai' ? 'AI' : 'Player 2');
      setMessage(`🏆 ${winnerName} Wins!`);

      // Win/Lose sound
      if (mode === 'ai') {
        winner === 1 ? soundManager.playWin() : soundManager.playLose();
      } else {
        soundManager.playWin();
      }

      setTimeout(() => {
        Alert.alert(
          '🏆 Game Over!',
          `${winnerName} wins by pushing 6 marbles off the board!`,
          [
            { text: '🔄 New Game', onPress: resetGame },
            { text: '🏠 Menu', onPress: () => navigation.goBack() },
          ]
        );
      }, 500);
    }
  }, [board]);

  // ===== AI TURN =====
  useEffect(() => {
    if (!isAITurn || gameOver) return;

    setAiThinking(true);

    const timer = setTimeout(() => {
      try {
        const ai = aiRef.current;
        const move = ai.getBestMove(board);

        if (move) {
          const newBoard = board.clone();
          MoveEngine.executeMove(newBoard, move);

          setBoard(newBoard);
          setSelectedMarbles([]);
          setValidMoves([]);
          setHighlightCells([]);

          if (move.pushOff) {
            setLastPushOff(true);
            setMessage('💥 AI pushed your marble off!');
            soundManager.playMarbleFall();
          } else if (move.push > 0) {
            soundManager.playMarblePush();
          } else {
            soundManager.playMarbleMove();
          }
        }
      } catch (error) {
        console.log('AI Error:', error);
        // Fallback to random move
        const allMoves = MoveEngine.getAllValidMoves(board, 2);
        if (allMoves.length > 0) {
          const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
          const newBoard = board.clone();
          MoveEngine.executeMove(newBoard, randomMove);
          setBoard(newBoard);
          setSelectedMarbles([]);
          setValidMoves([]);
          setHighlightCells([]);
        }
      }

      setAiThinking(false);
    }, difficulty === 'hard' ? 1500 : difficulty === 'medium' ? 1000 : 600);

    return () => clearTimeout(timer);
  }, [isAITurn, board, gameOver]);

  // ===== CELL PRESS HANDLER =====
  const onCellPress = useCallback((q, r, s) => {
    if (gameOver || isAITurn || aiThinking) return;

    const cell = board.getCell(q, r, s);
    if (!cell) return;

    const marbleCoord = { q, r, s };

    // CLICKING OWN MARBLE - Select/Deselect
    if (cell.marble === currentPlayer) {
      const alreadyIdx = selectedMarbles.findIndex(
        m => m.q === q && m.r === r && m.s === s
      );

      let newSelected;
      if (alreadyIdx !== -1) {
        // Deselect
        newSelected = selectedMarbles.filter((_, i) => i !== alreadyIdx);
        soundManager.playMarbleClick();
      } else if (selectedMarbles.length < 3) {
        newSelected = [...selectedMarbles, marbleCoord];
        soundManager.playMarbleSelect();

        // Validate: must be in line and adjacent
        if (newSelected.length > 1) {
          if (!MoveEngine.areInLine(newSelected)) {
            setMessage('❌ Marbles must be in a straight line!');
            soundManager.playInvalidMove();
            return;
          }
          const sorted = MoveEngine.sortByPosition(newSelected);
          for (let i = 0; i < sorted.length - 1; i++) {
            if (!MoveEngine.areAdjacent(sorted[i], sorted[i + 1])) {
              setMessage('❌ Marbles must be next to each other!');
              soundManager.playInvalidMove();
              return;
            }
          }
        }
      } else {
        setMessage('⚠️ Maximum 3 marbles can be selected!');
        soundManager.playInvalidMove();
        return;
      }

      setSelectedMarbles(newSelected);
      updateValidMoves(newSelected);
      return;
    }

    // CLICKING EMPTY/OPPONENT CELL - Try to move
    if (selectedMarbles.length > 0 && validMoves.length > 0) {
      // Find matching move
      for (const move of validMoves) {
        const dir = MoveEngine.getDirectionDelta(move.direction);
        if (!dir) continue;

        // Check if click matches any marble's destination
        let matches = false;

        if (move.type === 'inline') {
          // For inline, check front marble's destination
          const front = MoveEngine.getFrontMarble(selectedMarbles, move.direction);
          const destQ = front.q + dir[0];
          const destR = front.r + dir[1];
          const destS = front.s + dir[2];
          if (destQ === q && destR === r && destS === s) {
            matches = true;
          }
        } else {
          // For broadside, check any marble's destination
          matches = selectedMarbles.some(m => {
            return (m.q + dir[0]) === q && (m.r + dir[1]) === r && (m.s + dir[2]) === s;
          });
        }

        if (matches) {
          executeMove(move);
          return;
        }
      }
    }

    // Clicking nothing useful - clear selection
    if (cell.marble === null && selectedMarbles.length === 0) {
      setSelectedMarbles([]);
      setValidMoves([]);
      setHighlightCells([]);
    }
  }, [board, selectedMarbles, validMoves, currentPlayer, gameOver, isAITurn, aiThinking]);

  // Update valid moves and highlights
  const updateValidMoves = useCallback((selected) => {
    if (selected.length === 0) {
      setValidMoves([]);
      setHighlightCells([]);
      return;
    }

    const moves = MoveEngine.getValidMoves(board, selected, currentPlayer);
    setValidMoves(moves);

    // Calculate highlight cells
    const highlights = [];
    const highlightSet = new Set();

    moves.forEach(move => {
      const dir = MoveEngine.getDirectionDelta(move.direction);
      if (!dir) return;

      if (move.type === 'inline') {
        const front = MoveEngine.getFrontMarble(selected, move.direction);
        const hq = front.q + dir[0];
        const hr = front.r + dir[1];
        const hs = front.s + dir[2];
        const hKey = `${hq},${hr},${hs}`;
        if (!highlightSet.has(hKey) && board.isValidPosition(hq, hr, hs)) {
          highlightSet.add(hKey);
          highlights.push({
            q: hq, r: hr, s: hs,
            isPush: move.push > 0,
            isPushOff: move.pushOff,
          });
        }
      } else {
        selected.forEach(m => {
          const hq = m.q + dir[0];
          const hr = m.r + dir[1];
          const hs = m.s + dir[2];
          const hKey = `${hq},${hr},${hs}`;
          if (!highlightSet.has(hKey) && board.isValidPosition(hq, hr, hs)) {
            const isOwnMarble = selected.some(
              sm => sm.q === hq && sm.r === hr && sm.s === hs
            );
            if (!isOwnMarble) {
              highlightSet.add(hKey);
              highlights.push({ q: hq, r: hr, s: hs, isPush: false, isPushOff: false });
            }
          }
        });
      }
    });

    setHighlightCells(highlights);
  }, [board, currentPlayer]);

  // Execute move
  const executeMove = useCallback((move) => {
    const newBoard = board.clone();
    MoveEngine.executeMove(newBoard, move);

    setBoard(newBoard);
    setSelectedMarbles([]);
    setValidMoves([]);
    setHighlightCells([]);

    if (move.pushOff) {
      setLastPushOff(true);
      setMessage('💥 Marble pushed off the board!');
      soundManager.playMarbleFall();
    } else if (move.push > 0) {
      setMessage('👊 Marble pushed!');
      soundManager.playMarblePush();
    } else {
      soundManager.playMarbleMove();
    }
  }, [board]);

  // Reset
  const resetGame = () => {
    setBoard(new HexBoard());
    setSelectedMarbles([]);
    setValidMoves([]);
    setHighlightCells([]);
    setGameOver(false);
    setAiThinking(false);
    setLastPushOff(false);
    if (aiRef.current) {
      aiRef.current.transpositionTable = {};
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBtnText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.modeText}>
          {mode === 'ai' ? `🤖 vs AI (${difficulty})` : '👥 2 Player'}
        </Text>

        <TouchableOpacity style={styles.headerBtn} onPress={resetGame}>
          <Text style={styles.headerBtnText}>🔄 New</Text>
        </TouchableOpacity>
      </View>

      {/* Score Board */}
      <View style={styles.scoreRow}>
        <Animated.View style={[
          styles.scoreCard,
          currentPlayer === 1 && styles.activeScoreCard,
          currentPlayer === 1 && { transform: [{ scale: scoreAnim }] },
        ]}>
          <View style={[styles.marbleIcon, { backgroundColor: '#F0F0F0' }]} />
          <Text style={styles.playerLabel}>
            {currentPlayer === 1 ? '▶ ' : ''}Player 1
          </Text>
          <Text style={styles.scoreValue}>{board.player1Score}</Text>
          <Text style={styles.scoreMax}>/ 6</Text>
        </Animated.View>

        <View style={styles.turnIndicator}>
          <Text style={styles.turnEmoji}>
            {aiThinking ? '🤔' : currentPlayer === 1 ? '⚪' : '⚫'}
          </Text>
          <Text style={styles.turnLabel}>
            {aiThinking ? 'Thinking' : 'Turn'}
          </Text>
        </View>

        <Animated.View style={[
          styles.scoreCard,
          currentPlayer === 2 && styles.activeScoreCard,
          currentPlayer === 2 && { transform: [{ scale: scoreAnim }] },
        ]}>
          <View style={[styles.marbleIcon, { backgroundColor: '#333' }]} />
          <Text style={styles.playerLabel}>
            {currentPlayer === 2 ? '▶ ' : ''}
            {mode === 'ai' ? 'AI' : 'Player 2'}
          </Text>
          <Text style={styles.scoreValue}>{board.player2Score}</Text>
          <Text style={styles.scoreMax}>/ 6</Text>
        </Animated.View>
      </View>

      {/* Game Board */}
      <View style={styles.boardWrapper}>
        {aiThinking && (
          <View style={styles.thinkingOverlay}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        )}
        <GameBoard
          board={board}
          selectedMarbles={selectedMarbles}
          highlightCells={highlightCells}
          onCellPress={onCellPress}
          disabled={isAITurn || gameOver || aiThinking}
        />
      </View>

      {/* Message Bar */}
      <View style={[
        styles.messageBar,
        lastPushOff && styles.messageBarAlert,
        gameOver && styles.messageBarWin,
      ]}>
        <Text style={styles.messageText}>{message}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {selectedMarbles.length > 0 && !aiThinking && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setSelectedMarbles([]);
              setValidMoves([]);
              setHighlightCells([]);
            }}
          >
            <Text style={styles.clearBtnText}>✕ Clear</Text>
          </TouchableOpacity>
        )}

        {validMoves.length > 0 && !aiThinking && (
          <Text style={styles.movesInfo}>
            {validMoves.length} move{validMoves.length > 1 ? 's' : ''} •{' '}
            {validMoves.filter(m => m.push > 0).length} push
          </Text>
        )}
      </View>

      {/* Direction Buttons */}
      {selectedMarbles.length > 0 && validMoves.length > 0 && !aiThinking && (
        <View style={styles.dirContainer}>
          <View style={styles.dirRow}>
            {validMoves.map((move, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dirBtn,
                  move.pushOff && styles.dirBtnDanger,
                  move.push > 0 && !move.pushOff && styles.dirBtnPush,
                ]}
                onPress={() => executeMove(move)}
                activeOpacity={0.7}
              >
                <Text style={styles.dirArrow}>
                  {getDirEmoji(move.direction)}
                </Text>
                <Text style={styles.dirLabel}>
                  {move.push > 0
                    ? move.pushOff
                      ? `💥 Push Off!`
                      : `👊 Push ${move.push}`
                    : getDirName(move.direction)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function getDirEmoji(dir) {
  const e = {
    right: '➡️', topRight: '↗️', topLeft: '↖️',
    left: '⬅️', bottomLeft: '↙️', bottomRight: '↘️',
  };
  return e[dir] || '•';
}

function getDirName(dir) {
  const n = {
    right: 'Right', topRight: 'Top-R', topLeft: 'Top-L',
    left: 'Left', bottomLeft: 'Bot-L', bottomRight: 'Bot-R',
  };
  return n[dir] || dir;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 42,
    paddingBottom: 8,
    backgroundColor: '#111128',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerBtnText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  modeText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#151530',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#252550',
  },
  activeScoreCard: {
    borderColor: '#FFD700',
    backgroundColor: '#1a1a40',
  },
  marbleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#555',
  },
  playerLabel: {
    color: '#AAA',
    fontSize: 11,
    fontWeight: '600',
  },
  scoreValue: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scoreMax: {
    color: '#555',
    fontSize: 12,
  },
  turnIndicator: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  turnEmoji: {
    fontSize: 28,
  },
  turnLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thinkingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  messageBar: {
    backgroundColor: '#1a1a30',
    marginHorizontal: 15,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252550',
  },
  messageBarAlert: {
    backgroundColor: '#2a1a0a',
    borderColor: '#FF6600',
  },
  messageBarWin: {
    backgroundColor: '#1a2a0a',
    borderColor: '#66FF00',
  },
  messageText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 20,
    gap: 15,
  },
  clearBtn: {
    backgroundColor: '#2a2a40',
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  clearBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  movesInfo: {
    color: '#FFD700',
    fontSize: 12,
  },
  dirContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 15,
  },
  dirRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  dirBtn: {
    backgroundColor: '#1a1a35',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 75,
  },
  dirBtnPush: {
    borderColor: '#FF9800',
    backgroundColor: '#251a0a',
  },
  dirBtnDanger: {
    borderColor: '#FF4444',
    backgroundColor: '#2a0a0a',
  },
  dirArrow: {
    fontSize: 18,
  },
  dirLabel: {
    color: '#CCC',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default GameScreen;