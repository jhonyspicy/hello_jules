import React from 'react';
import { Player } from '../types';
import './Cell.css'; // Import the CSS file

interface CellProps {
  value: Player;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ value, onClick }) => {
  let pieceSpecificClass = "";
  if (value === 'black') {
    pieceSpecificClass = 'cell-black'; // Used for the piece's color
  } else if (value === 'white') {
    pieceSpecificClass = 'cell-white'; // Used for the piece's color
  }

  // The outer div gets 'cell' and 'cell-empty' if applicable for hover effects
  const cellContainerClass = `cell ${value === null ? 'cell-empty' : ''}`;

  return (
    <div className={cellContainerClass} onClick={onClick}>
      {value && <div className={`piece ${pieceSpecificClass}`}></div>}
    </div>
  );
};

export default Cell;
