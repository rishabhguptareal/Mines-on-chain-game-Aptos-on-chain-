module mines_game {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    use aptos_framework::aptos_coin::AptosCoin;

    const GRID_SIZE: u64 = 3;
    const TARGET_REVEALS: u64 = 4;
    const MINE_COUNT: u64 = 1;

    struct GameState has key {
        games: Table<address, Game>,
    }

    struct Game has store {
        grid: vector<vector<bool>>,
        revealed: vector<vector<bool>>,
        bet_amount: u64,
        is_active: bool,
        revealed_count: u64,
    }

    public entry fun initialize_game(account: &signer, bet_amount: u64) acquires GameState {
        let account_addr = signer::address_of(account);
        
        // Transfer bet amount to module
        coin::transfer<AptosCoin>(account, @mines_game, bet_amount);

        // Initialize game state if it doesn't exist
        if (!exists<GameState>(account_addr)) {
            move_to(account, GameState {
                games: table::new(),
            });
        };

        let game_state = borrow_global_mut<GameState>(account_addr);
        
        // Generate grid with mines
        let grid = generate_grid();
        let revealed = generate_empty_grid();

        let game = Game {
            grid,
            revealed,
            bet_amount,
            is_active: true,
            revealed_count: 0,
        };

        table::upsert(&mut game_state.games, account_addr, game);
    }

    public entry fun reveal_tile(account: &signer, row: u64, col: u64) acquires GameState {
        let account_addr = signer::address_of(account);
        let game_state = borrow_global_mut<GameState>(account_addr);
        let game = table::borrow_mut(&mut game_state.games, account_addr);

        assert!(game.is_active, 1); // Game must be active
        assert!(row < GRID_SIZE && col < GRID_SIZE, 2); // Valid coordinates

        let revealed_row = vector::borrow_mut(&mut game.revealed, row);
        let is_revealed = vector::borrow(revealed_row, col);
        assert!(!*is_revealed, 3); // Tile must not be already revealed

        // Mark tile as revealed
        *vector::borrow_mut(revealed_row, col) = true;
        game.revealed_count = game.revealed_count + 1;

        // Check if mine hit
        let grid_row = vector::borrow(&game.grid, row);
        let is_mine = vector::borrow(grid_row, col);

        if (*is_mine) {
            // Game over - player loses
            game.is_active = false;
        } else if (game.revealed_count >= TARGET_REVEALS) {
            // Player wins
            game.is_active = false;
            let reward = calculate_reward(game.bet_amount, game.revealed_count);
            coin::transfer<AptosCoin>(@mines_game, account_addr, reward);
        };
    }

    public entry fun cash_out(account: &signer) acquires GameState {
        let account_addr = signer::address_of(account);
        let game_state = borrow_global_mut<GameState>(account_addr);
        let game = table::borrow_mut(&mut game_state.games, account_addr);

        assert!(game.is_active, 1); // Game must be active

        // Calculate and transfer reward
        let reward = calculate_reward(game.bet_amount, game.revealed_count);
        coin::transfer<AptosCoin>(@mines_game, account_addr, reward);

        // End game
        game.is_active = false;
    }

    fun generate_grid(): vector<vector<bool>> {
        let grid = vector::empty<vector<bool>>();
        let mines_placed = 0;

        // Initialize empty grid
        let i = 0;
        while (i < GRID_SIZE) {
            let row = vector::empty<bool>();
            let j = 0;
            while (j < GRID_SIZE) {
                vector::push_back(&mut row, false);
                j = j + 1;
            };
            vector::push_back(&mut grid, row);
            i = i + 1;
        };

        // Place mines using timestamp as randomness source
        while (mines_placed < MINE_COUNT) {
            let random = timestamp::now_microseconds();
            let row = (random % GRID_SIZE) as u64;
            let col = ((random / GRID_SIZE) % GRID_SIZE) as u64;

            let grid_row = vector::borrow_mut(&mut grid, row);
            let cell = vector::borrow_mut(grid_row, col);

            if (!*cell) {
                *cell = true;
                mines_placed = mines_placed + 1;
            };
        };

        grid
    }

    fun generate_empty_grid(): vector<vector<bool>> {
        let grid = vector::empty<vector<bool>>();
        let i = 0;
        while (i < GRID_SIZE) {
            let row = vector::empty<bool>();
            let j = 0;
            while (j < GRID_SIZE) {
                vector::push_back(&mut row, false);
                j = j + 1;
            };
            vector::push_back(&mut grid, row);
            i = i + 1;
        };
        grid
    }

    fun calculate_reward(bet_amount: u64, revealed_count: u64): u64 {
        // Simple multiplier based on revealed count
        let multiplier = (revealed_count as u64) * 2;
        bet_amount * multiplier
    }
}