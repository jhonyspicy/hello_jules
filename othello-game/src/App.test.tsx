import {
  initializeBoard,
  calculateScores,
  getFlippablePieces,
  isValidMove,
  playerHasAnyValidMoves,
  BOARD_SIZE,
} from './App'; // Assuming these are now exported correctly
import { Player, Board as BoardType } from './types';

describe('Othello Game Logic', () => {
  describe('initializeBoard', () => {
    const board = initializeBoard();

    test('should create an 8x8 board', () => {
      expect(board.length).toBe(BOARD_SIZE);
      board.forEach(row => {
        expect(row.length).toBe(BOARD_SIZE);
      });
    });

    test('should place initial pieces correctly', () => {
      expect(board[3][3]).toBe('white');
      expect(board[4][4]).toBe('white');
      expect(board[3][4]).toBe('black');
      expect(board[4][3]).toBe('black');
    });

    test('should have null for other cells', () => {
      let otherCellsNull = true;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (!((r === 3 && c === 3) || (r === 4 && c === 4) || (r === 3 && c === 4) || (r === 4 && c === 3))) {
            if (board[r][c] !== null) {
              otherCellsNull = false;
              break;
            }
          }
        }
        if (!otherCellsNull) break;
      }
      expect(otherCellsNull).toBe(true);
    });
  });

  describe('calculateScores', () => {
    test('should return correct scores for the initial board', () => {
      const board = initializeBoard();
      const scores = calculateScores(board);
      expect(scores.black).toBe(2);
      expect(scores.white).toBe(2);
    });

    test('should return correct scores for a custom board', () => {
      const board: BoardType = [
        [null, null, null, null, null, null, null, null],
        [null, 'black', 'black', null, null, null, null, null],
        [null, 'white', 'white', 'white', null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
      ];
      const scores = calculateScores(board);
      expect(scores.black).toBe(2);
      expect(scores.white).toBe(3);
    });

    test('should return 0 for an empty board', () => {
      const board: BoardType = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      const scores = calculateScores(board);
      expect(scores.black).toBe(0);
      expect(scores.white).toBe(0);
    });
  });

  describe('getFlippablePieces', () => {
    let board: BoardType;

    beforeEach(() => {
      // Start with a clean board for some tests, others will define specific setups
      board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    });

    test('should return empty array if no pieces to flip (e.g., corner)', () => {
      board[0][1] = 'white'; // Opponent
      const flippable = getFlippablePieces(0, 0, 'black', board);
      expect(flippable).toEqual([]);
    });
    
    test('should flip pieces horizontally (right)', () => {
      board[3][2] = 'white'; // W
      board[3][3] = 'white'; // W
      board[3][4] = 'black'; // B (anchor)
      // Try to place black at 3,1 -> B W W B
      const flippable = getFlippablePieces(3, 1, 'black', board);
      expect(flippable).toEqual(expect.arrayContaining([[3, 2], [3, 3]]));
      expect(flippable.length).toBe(2);
    });

    test('should flip pieces vertically (down)', () => {
      board[2][3] = 'white'; // W
      board[3][3] = 'white'; // W
      board[4][3] = 'black'; // B (anchor)
      // Try to place black at 1,3
      const flippable = getFlippablePieces(1, 3, 'black', board);
      expect(flippable).toEqual(expect.arrayContaining([[2, 3], [3, 3]]));
      expect(flippable.length).toBe(2);
    });

    test('should flip pieces diagonally (down-right)', () => {
      board[2][2] = 'white'; // W
      board[3][3] = 'white'; // W
      board[4][4] = 'black'; // B (anchor)
      // Try to place black at 1,1
      const flippable = getFlippablePieces(1, 1, 'black', board);
      expect(flippable).toEqual(expect.arrayContaining([[2, 2], [3, 3]]));
      expect(flippable.length).toBe(2);
    });

    test('should flip pieces in multiple directions', () => {
      // B W B
      // W B W
      // B W _ (place black here at 2,2)
      board[0][0] = 'black'; board[0][1] = 'white'; board[0][2] = 'black';
      board[1][0] = 'white'; board[1][1] = 'black'; board[1][2] = 'white';
      board[2][0] = 'black'; board[2][1] = 'white'; /* board[2][2] is null */
      
      const flippable = getFlippablePieces(2, 2, 'black', board);
      // Expected: (0,1) via (1,1) is not valid as (1,1) is black.
      // Expected: (1,2) via (1,1) is not valid.
      // Expected: (2,1) horizontal
      // Expected: (1,2) vertical (if board[0][2] was white, but it's black - no, this is wrong)
      // Expected: (0,2) diagonal (if board[1][2] was white - no, this is wrong)
      // Let's re-evaluate based on the setup BWB / W_W / BWB (placing at 1,1 for 'black')
      // B W B
      // W _ W
      // B W B
      // place 'black' at board[1][1]
      board = initializeBoard(); // Reset to standard board
      // Initial:
      // ....
      // ..WB..
      // ..BW..
      // ....
      // Player 'black' plays at (2,3) (row 2, col 3)
      // Current board state for this:
      // [3][3]=W, [4][4]=W, [3][4]=B, [4][3]=B
      // Place black at [2][3]
      // W at [3][3] should flip
      board = initializeBoard();
      const flippableForBlackMove = getFlippablePieces(2, 3, 'black', board);
      expect(flippableForBlackMove).toEqual(expect.arrayContaining([[3,3]]));
      expect(flippableForBlackMove.length).toBe(1);


      // More complex:
      // .....B
      // .....W
      // ..BWW.  <- Place 'B' at (2,5)
      // .....W
      // .....B
      board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      board[0][5] = 'black';
      board[1][5] = 'white'; // to flip (vertical)
      board[2][2] = 'black';
      board[2][3] = 'white'; // to flip (horizontal)
      board[2][4] = 'white'; // to flip (horizontal)
      board[3][5] = 'white'; // to flip (vertical)
      board[4][5] = 'black';
      
      const flippableMulti = getFlippablePieces(2, 5, 'black', board);
      expect(flippableMulti).toEqual(expect.arrayContaining([
        [1, 5], [3, 5], // Vertical
        [2, 3], [2, 4]  // Horizontal
      ]));
      expect(flippableMulti.length).toBe(4);
    });

    test('should not flip if blocked by own piece', () => {
      board[3][2] = 'white';
      board[3][3] = 'black'; // Own piece blocking
      board[3][4] = 'black';
      const flippable = getFlippablePieces(3, 1, 'black', board);
      expect(flippable).toEqual([]);
    });

    test('should not flip if opponent pieces are not enclosed', () => {
      board[3][2] = 'white';
      board[3][3] = 'white';
      // board[3][4] is null (no enclosing piece)
      const flippable = getFlippablePieces(3, 1, 'black', board);
      expect(flippable).toEqual([]);
    });

    test('should handle edge of board correctly', () => {
      board[0][0] = 'black'; // anchor
      board[0][1] = 'white'; // W
      board[0][2] = 'white'; // W
      // Try to place black at 0,3
      const flippable = getFlippablePieces(0, 3, 'black', board);
      expect(flippable).toEqual(expect.arrayContaining([[0, 1], [0, 2]]));
      expect(flippable.length).toBe(2);
    });
  });

  describe('isValidMove', () => {
    const board = initializeBoard(); // Use initial board for some tests

    test('should be invalid for occupied cells', () => {
      expect(isValidMove(3, 3, 'black', board)).toBe(false); // Occupied by white
      expect(isValidMove(3, 4, 'white', board)).toBe(false); // Occupied by black
    });

    test('should be valid for a valid move', () => {
      // Black plays at (2,3) on initial board, should flip (3,3) white
      expect(isValidMove(2, 3, 'black', board)).toBe(true);
      // White plays at (2,4) on initial board, should flip (3,4) black
      expect(isValidMove(2, 4, 'white', board)).toBe(true);
    });

    test('should be invalid for a move with no flippable pieces', () => {
      expect(isValidMove(0, 0, 'black', board)).toBe(false); // No pieces to flip
    });
  });

  describe('playerHasAnyValidMoves', () => {
    test('should return true if player has valid moves (initial board, black)', () => {
      const board = initializeBoard();
      expect(playerHasAnyValidMoves('black', board)).toBe(true);
    });

    test('should return true if player has valid moves (initial board, white)', () => {
      const board = initializeBoard();
      expect(playerHasAnyValidMoves('white', board)).toBe(true);
    });

    test('should return false if player has no valid moves', () => {
      // Create a board where black has no moves
      // B B B
      // B W B
      // B B B
      const board: BoardType = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      for(let r=0; r<3; r++) for(let c=0; c<3; c++) board[r][c] = 'black';
      board[1][1] = 'white';
      // Black cannot move into the 3x3 block. White can move at (1,1) if it was black's turn.
      // Let's test for 'white' - white has no valid moves here because all surrounding are black.
      expect(playerHasAnyValidMoves('white', board)).toBe(false);
    });

    test('should return false if neither player has moves (checkerboard full)', () => {
      const board: BoardType = [];
      for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
          board[i][j] = (i + j) % 2 === 0 ? 'black' : 'white';
        }
      }
      // On a full checkerboard, no empty cells, so no valid moves.
      expect(playerHasAnyValidMoves('black', board)).toBe(false);
      expect(playerHasAnyValidMoves('white', board)).toBe(false);
    });
  });
});
