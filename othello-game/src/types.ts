export type Player = 'black' | 'white' | null;

export type Board = Player[][];

export interface GameStatus {
  currentPlayer: 'black' | 'white';
  scores: {
    black: number;
    white: number;
  };
  gameOver: boolean;
  winner: Player;
}
