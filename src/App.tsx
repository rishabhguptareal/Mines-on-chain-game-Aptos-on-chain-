import React from 'react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { GameGrid } from './components/GameGrid';
import { GameStats } from './components/GameStats';
import { BetInput } from './components/BetInput';
import { useGameLogic } from './hooks/useGameLogic';
import { Toaster } from 'react-hot-toast';

const wallets = [new PetraWallet()];

function App() {
  const { account } = useWallet();
  const { gameState, calculateStats, initializeGame, revealTile, cashOut } = useGameLogic();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Mines Game</h1>
            <WalletSelector />
          </div>

          {account ? (
            <div className="space-y-8">
              <BetInput
                onBet={initializeGame}
                disabled={!gameState.isGameOver}
              />
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <GameGrid
                    gameState={gameState}
                    onTileClick={revealTile}
                  />
                </div>
                
                <div className="flex-1">
                  <GameStats
                    stats={calculateStats()}
                    onCashOut={cashOut}
                    isGameActive={!gameState.isGameOver}
                  />
                </div>
              </div>

              {gameState.isGameOver && (
                <div className={`p-4 rounded-lg text-center text-xl font-bold ${
                  gameState.isWinner ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {gameState.isWinner
                    ? `Congratulations! You won ${(gameState.betAmount * calculateStats().multiplier).toFixed(2)} APT`
                    : 'Game Over! Better luck next time!'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Connect your wallet to play</h2>
              <p className="text-gray-400">Use the wallet selector above to connect your Petra wallet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;