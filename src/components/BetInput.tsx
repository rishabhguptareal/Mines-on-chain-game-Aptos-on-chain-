import React, { useState } from 'react';

interface BetInputProps {
  onBet: (amount: number) => void;
  disabled: boolean;
}

export const BetInput: React.FC<BetInputProps> = ({ onBet, disabled }) => {
  const [amount, setAmount] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const betAmount = parseFloat(amount);
    if (betAmount > 0) {
      onBet(betAmount);
      setAmount('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter bet amount"
        min="0"
        step="0.1"
        disabled={disabled}
        className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={disabled || !amount}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200"
      >
        Place Bet
      </button>
    </form>
  );
};