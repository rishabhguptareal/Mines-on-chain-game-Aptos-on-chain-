const GRID_SIZE = 3;
const TARGET_REVEALS = 4;
const MINE_COUNT = 1;

class MinesGame {
    constructor() {
        this.gameState = {
            grid: [],
            revealed: [],
            betAmount: 0,
            isGameOver: false,
            isWinner: false,
            revealedCount: 0
        };
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.betInput = document.getElementById('bet-amount');
        this.placeBetBtn = document.getElementById('place-bet');
        this.gameGrid = document.querySelector('.game-grid');
        this.cashoutBtn = document.getElementById('cashout');
        this.gameResult = document.getElementById('game-result');
        this.currentMultiplier = document.getElementById('current-multiplier');
        this.nextMultiplier = document.getElementById('next-multiplier');
        this.successChance = document.getElementById('success-chance');
    }

    attachEventListeners() {
        this.placeBetBtn.addEventListener('click', () => this.startGame());
        this.cashoutBtn.addEventListener('click', () => this.cashout());
        
        // Listen for wallet connection
        window.addEventListener('walletConnected', () => {
            this.placeBetBtn.disabled = false;
        });
    }

    generateGrid() {
        const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
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
    }

    async startGame() {
        const betAmount = parseFloat(this.betInput.value);
        if (isNaN(betAmount) || betAmount <= 0) {
            alert('Please enter a valid bet amount');
            return;
        }

        try {
            this.gameState = {
                grid: this.generateGrid(),
                revealed: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false)),
                betAmount,
                isGameOver: false,
                isWinner: false,
                revealedCount: 0
            };

            this.renderGame();
            this.updateStats();
            this.cashoutBtn.classList.remove('hidden');
            this.betInput.disabled = true;
            this.placeBetBtn.disabled = true;
        } catch (error) {
            console.error('Failed to start game:', error);
            alert('Failed to start game');
        }
    }

    renderGame() {
        this.gameGrid.innerHTML = '';
        
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                
                if (this.gameState.revealed[row][col]) {
                    tile.classList.add('revealed');
                    tile.classList.add(this.gameState.grid[row][col] ? 'mine' : 'safe');
                    tile.textContent = this.gameState.grid[row][col] ? '💣' : '💎';
                } else {
                    tile.addEventListener('click', () => this.revealTile(row, col));
                }
                
                this.gameGrid.appendChild(tile);
            }
        }
    }

    updateStats() {
        const remaining = GRID_SIZE * GRID_SIZE - this.gameState.revealedCount;
        const safeSpots = remaining - MINE_COUNT;
        const probability = safeSpots / remaining;
        const multiplier = (1 / probability).toFixed(2);
        const nextMultiplier = (1 / ((safeSpots - 1) / (remaining - 1))).toFixed(2);

        this.currentMultiplier.textContent = `${multiplier}x`;
        this.nextMultiplier.textContent = `${nextMultiplier}x`;
        this.successChance.textContent = `${(probability * 100).toFixed(1)}%`;
    }

    async revealTile(row, col) {
        if (this.gameState.isGameOver || this.gameState.revealed[row][col]) return;

        try {
            this.gameState.revealed[row][col] = true;
            this.gameState.revealedCount++;

            if (this.gameState.grid[row][col]) {
                this.gameState.isGameOver = true;
                this.gameState.isWinner = false;
                this.showGameResult(false);
            } else if (this.gameState.revealedCount >= TARGET_REVEALS) {
                this.gameState.isGameOver = true;
                this.gameState.isWinner = true;
                this.showGameResult(true);
            }

            this.renderGame();
            this.updateStats();
        } catch (error) {
            console.error('Failed to reveal tile:', error);
            alert('Failed to reveal tile');
        }
    }

    showGameResult(isWin) {
        this.gameResult.classList.remove('hidden');
        this.gameResult.classList.add(isWin ? 'win' : 'lose');
        this.gameResult.textContent = isWin 
            ? `Congratulations! You won ${(this.gameState.betAmount * parseFloat(this.currentMultiplier.textContent)).toFixed(2)} APT`
            : 'Game Over! Better luck next time!';
        
        this.cashoutBtn.classList.add('hidden');
        this.betInput.disabled = false;
        this.placeBetBtn.disabled = false;
    }

    async cashout() {
        if (this.gameState.isGameOver) return;

        try {
            this.gameState.isGameOver = true;
            this.gameState.isWinner = true;
            this.showGameResult(true);
        } catch (error) {
            console.error('Failed to cash out:', error);
            alert('Failed to cash out');
        }
    }
}

export default MinesGame;