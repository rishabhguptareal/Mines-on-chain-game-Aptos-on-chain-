import React from 'react';
import { GameStats } from '../types/game';

interface GameStatsProps {
  stats: GameStats;
  onCashOut: () => void;
  isGameActive: boolean;
}

export const GameStats: React.FC<GameStatsProps> = ({ stats, onCashOut, isGameActive }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-gray-400">Current Multiplier</p>
          <p className="text-2xl font-bold text-white">{stats.multiplier}x</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Next Multiplier</p>
          <p className="text-2xl font-bold text-white">{stats.nextMultiplier}x</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Success Chance</p>
          <p className="text-2xl font-bold text-white">{stats.probability.toFixed(1)}%</p>
        </div>
      </div>
      {isGameActive && (
        <button
          onClick={onCashOut}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Cash Out
        </button>
      )}
    </div>
  );
};