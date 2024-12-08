import { useState, useCallback } from 'react';
import { GameState, GameStats } from '../types/game';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Account, Aptos, Network } from '@aptos-labs/ts-sdk';

const GRID_SIZE = 3;
const TARGET_REVEALS = 4;
const MINE_COUNT = 1;

export const useGameLogic = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [gameState, setGameState] = useState<GameState>({
    grid: Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(false)),
    revealed: Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(false)),
    betAmount: 0,
    isGameOver: false,
    isWinner: false,
    revealedCount: 0,
  });

  const calculateStats = useCallback((): GameStats => {
    const remaining = GRID_SIZE * GRID_SIZE - gameState.revealedCount;
    const safeSpots = remaining - MINE_COUNT;
    const probability = safeSpots / remaining;
    const multiplier = (1 / probability).toFixed(2);
    const nextMultiplier = (1 / ((safeSpots - 1) / (remaining - 1))).toFixed(2);

    return {
      multiplier: parseFloat(multiplier),
      nextMultiplier: parseFloat(nextMultiplier),
      probability: probability * 100,
    };
  }, [gameState.revealedCount]);

  const initializeGame = async (betAmount: number) => {
    if (!account) return;

    try {
      const aptos = new Aptos(Network.TESTNET);
      
      // Initialize game transaction
      await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: "0x1::mines_game::initialize_game",
          typeArguments: [],
          functionArguments: [betAmount],
        },
      });

      setGameState({
        grid: generateGrid(),
        revealed: Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(false)),
        betAmount,
        isGameOver: false,
        isWinner: false,
        revealedCount: 0,
      });
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  };

  const generateGrid = () => {
    const grid = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));
    let minesPlaced = 0;

    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      
      if (!grid[row][col]) {
        grid[row][col] = true;
        minesPlaced++;
      }
    }

    return grid;
  };

  const revealTile = async (row: number, col: number) => {
    if (!account || gameState.isGameOver || gameState.revealed[row][col]) return;

    try {
      const aptos = new Aptos(Network.TESTNET);
      
      // Reveal tile transaction
      await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: "0x1::mines_game::reveal_tile",
          typeArguments: [],
          functionArguments: [row, col],
        },
      });

      const newRevealed = gameState.revealed.map(r => [...r]);
      newRevealed[row][col] = true;

      if (gameState.grid[row][col]) {
        setGameState(prev => ({
          ...prev,
          revealed: newRevealed,
          isGameOver: true,
          isWinner: false,
        }));
      } else {
        const newRevealedCount = gameState.revealedCount + 1;
        const isWinner = newRevealedCount >= TARGET_REVEALS;

        setGameState(prev => ({
          ...prev,
          revealed: newRevealed,
          revealedCount: newRevealedCount,
          isGameOver: isWinner,
          isWinner,
        }));
      }
    } catch (error) {
      console.error('Failed to reveal tile:', error);
    }
  };

  const cashOut = async () => {
    if (!account || gameState.isGameOver) return;

    try {
      await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: "0x1::mines_game::cash_out",
          typeArguments: [],
          functionArguments: [],
        },
      });

      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        isWinner: true,
      }));
    } catch (error) {
      console.error('Failed to cash out:', error);
    }
  };

  return {
    gameState,
    calculateStats,
    initializeGame,
    revealTile,
    cashOut,
  };
};