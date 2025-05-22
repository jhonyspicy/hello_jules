import React from 'react';
import { Board as BoardType, Player } from '../types';
import Cell from './Cell';
import './Board.css'; // Import the CSS file

interface BoardProps {
  board: BoardType;
  onCellClick: (row: number, col: number) => void;
}

const BoardComponent: React.FC<BoardProps> = ({ board, onCellClick }) => {
  return (
    <div className="game-board">
      {board.map((row, rowIndex) => (
        // The .board-row div is kept for structure, but .game-board with display:grid handles layout.
        // The .board-row can be styled with 'display: contents;' if needed, as done in Board.css.
        <div key={rowIndex} className="board-row">
          {row.map((cellValue: Player, colIndex: number) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cellValue}
              onClick={() => onCellClick(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardComponent;
