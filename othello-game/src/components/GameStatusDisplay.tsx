import React from 'react';
import { GameStatus } from '../types';

interface GameStatusDisplayProps {
  status: GameStatus;
}

const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({ status }) => {
  const { currentPlayer, scores, gameOver, winner } = status;

  return (
    <div className="game-status-display">
      <div>Current Player: {currentPlayer === 'black' ? 'Black' : 'White'}</div>
      <div>Score: Black - {scores.black}, White - {scores.white}</div>
      {gameOver && (
        <div>
          <h2>Game Over!</h2>
          {winner ? (
            <p>Winner: {winner === 'black' ? 'Black' : 'White'}</p>
          ) : (
            <p>It's a Draw!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GameStatusDisplay;
