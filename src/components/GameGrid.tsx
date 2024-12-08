import React from 'react';
import { GameState } from '../types/game';
import { Diamond, Bomb } from 'lucide-react';

interface GameGridProps {
  gameState: GameState;
  onTileClick: (row: number, col: number) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({ gameState, onTileClick }) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {gameState.grid.map((row, rowIndex) => (
        row.map((isMine, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            onClick={() => onTileClick(rowIndex, colIndex)}
            disabled={gameState.isGameOver || gameState.revealed[rowIndex][colIndex]}
            className={`
              w-20 h-20 rounded-lg flex items-center justify-center
              ${gameState.revealed[rowIndex][colIndex]
                ? isMine
                  ? 'bg-red-500'
                  : 'bg-green-500'
                : 'bg-gray-700 hover:bg-gray-600'}
              transition-colors duration-200
              ${gameState.isGameOver ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {gameState.revealed[rowIndex][colIndex] && (
              isMine ? (
                <Bomb className="w-8 h-8 text-white" />
              ) : (
                <Diamond className="w-8 h-8 text-white" />
              )
            )}
          </button>
        ))
      ))}
    </div>
  );
};