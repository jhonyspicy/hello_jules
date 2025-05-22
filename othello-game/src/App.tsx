import React, { useState, useEffect, useCallback } from 'react';
import { Player, Board as BoardType } from './types'; // GameStatus removed as it's an interface for props
import BoardComponent from './components/Board';
import GameStatusDisplay from './components/GameStatusDisplay';
import './App.css'; // Assuming App.css exists for basic styling

export const BOARD_SIZE = 8; // Exporting for potential use in tests or other modules

export const initializeBoard = (): BoardType => { // No longer useCallback, moved outside
  const newBoard: BoardType = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
    newBoard[3][3] = 'white';
    newBoard[4][4] = 'white';
    newBoard[3][4] = 'black';
    newBoard[4][3] = 'black';
    return newBoard;
};

export const calculateScores = (currentBoard: BoardType): { black: number; white: number } => { // No longer useCallback
  let black = 0;
  let white = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (currentBoard[r][c] === 'black') black++;
      else if (currentBoard[r][c] === 'white') white++;
    }
  }
  return { black, white };
};

export const getFlippablePieces = (row: number, col: number, player: 'black' | 'white', currentBoard: BoardType): [number, number][] => { // No longer useCallback
    const opponent: Player = player === 'black' ? 'white' : 'black';
    const allFlippablePieces: [number, number][] = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1],
    ];

    for (const [dr, dc] of directions) {
      let currRow = row + dr;
      let currCol = col + dc;
      const piecesInDirectionToFlip: [number, number][] = [];

      while (currRow >= 0 && currRow < BOARD_SIZE && currCol >= 0 && currCol < BOARD_SIZE) {
        if (currentBoard[currRow][currCol] === opponent) {
          piecesInDirectionToFlip.push([currRow, currCol]);
        } else if (currentBoard[currRow][currCol] === player) {
          allFlippablePieces.push(...piecesInDirectionToFlip);
          break; 
        } else { // Empty cell
          break;
        }
        currRow += dr;
        currCol += dc;
      }
    }
    return allFlippablePieces;
};

export const isValidMove = (row: number, col: number, player: 'black' | 'white', currentBoard: BoardType): boolean => { // No longer useCallback
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE || currentBoard[row][col] !== null) {
    return false;
  }
  const flippablePieces = getFlippablePieces(row, col, player, currentBoard);
  return flippablePieces.length > 0;
};

export const playerHasAnyValidMoves = (player: 'black' | 'white', currentBoard: BoardType): boolean => { // No longer useCallback
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidMove(r, c, player, currentBoard)) {
        return true;
      }
    }
  }
  return false;
};

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardType>(() => initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');
  const [scores, setScores] = useState<{ black: number; white: number }>({ black: 0, white: 0 });
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player>(null);

  useEffect(() => {
    setScores(calculateScores(board));
  }, [board]);

  const handleClick = useCallback((row: number, col: number) => {
    if (gameOver || board[row][col] !== null) {
      return;
    }

    // Use the exported version of getFlippablePieces
    const flippable = getFlippablePieces(row, col, currentPlayer, board);
    if (flippable.length === 0) {
      console.log("Invalid move for player: ", currentPlayer);
      return;
    }

    const newBoard = board.map(arrRow => [...arrRow]);
    newBoard[row][col] = currentPlayer;
    flippable.forEach(([r, c]) => {
      newBoard[r][c] = currentPlayer;
    });
    setBoard(newBoard);

    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black';

    // Use the exported versions of playerHasAnyValidMoves and calculateScores
    if (playerHasAnyValidMoves(nextPlayer, newBoard)) {
      setCurrentPlayer(nextPlayer);
    } else if (playerHasAnyValidMoves(currentPlayer, newBoard)) {
      console.log(`Player ${nextPlayer} has no valid moves. Player ${currentPlayer} plays again.`);
    } else {
      setGameOver(true);
      const finalScores = calculateScores(newBoard);
      if (finalScores.black > finalScores.white) {
        setWinner('black');
      } else if (finalScores.white > finalScores.black) {
        setWinner('white');
      } else {
        setWinner(null);
      }
    }
  }, [board, currentPlayer, gameOver]); // Removed dependencies on the useCallback versions of helper functions

  const handleNewGame = () => {
    setBoard(initializeBoard()); // Uses exported function
    setCurrentPlayer('black');
    setGameOver(false);
    setWinner(null);
  };
  
  useEffect(() => {
    const isBoardFull = board.every(row => row.every(cell => cell !== null));
    if (isBoardFull && !gameOver) {
        setGameOver(true);
        const currentScores = calculateScores(board); // Uses exported function
        if (currentScores.black > currentScores.white) {
            setWinner('black');
        } else if (currentScores.white > currentScores.black) {
            setWinner('white');
        } else {
            setWinner(null);
        }
    }
  }, [board, gameOver, winner]); // Removed calculateScores from dependency array as it's now stable

  return (
    <div className="App">
      <h1>Othello Game</h1>
      <GameStatusDisplay status={{ currentPlayer, scores, gameOver, winner }} />
      <BoardComponent board={board} onCellClick={handleClick} />
      <button onClick={handleNewGame} style={{ marginTop: '20px' }}>
        New Game
      </button>
    </div>
  );
};

export default App;

// Export functions for testing if they are defined outside the component as shown above
// export { BOARD_SIZE, initializeBoard, calculateScores, getFlippablePieces, isValidMove, playerHasAnyValidMoves };
// No, this is not needed because they are already exported individually with `export const ...`
