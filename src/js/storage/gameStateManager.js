// ============================================
// Game state manager that saves and restores game state for resume on refresh
// ============================================

import { STORAGE_KEYS } from '../config.js';
import { gameState } from '../game/gameState.js';

/**
 * Save current game state to localStorage
 * WHY: Allow player to resume game after refresh
 * WHEN: After every significant game action
 */
export function saveGameState() {
    const state = {
        // Game session info
        gameId: gameState.gameId,
        opponent: gameState.getOpponent(),
        yourTurn: gameState.isYourTurn(),
        shipsSentToServer: gameState.areShipsSent(),
        
        // Ship placements
        placedShips: gameState.getPlacedShips(),
        
        // Game stats
        stats: gameState.getStats(),
        
        // Board states (hits/misses)
        playerBoardState: captureBoardState('player-board'),
        firingBoardState: captureBoardState('firing-board'),
        
        // Timestamp
        savedAt: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
    console.log('💾 Game state saved');
}

/**
 * Load saved game state from localStorage
 * WHY: Restore game after page refresh
 * RETURNS: Saved state or null if no game in progress
 */
export function loadGameState() {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (!saved) return null;
    
    try {
        const state = JSON.parse(saved);
        
        // Check if state is recent (within 24 hours)
        const hoursSinceSave = (Date.now() - state.savedAt) / (1000 * 60 * 60);
        if (hoursSinceSave > 24) {
            clearGameState();
            return null;
        }
        
        console.log('📂 Game state loaded');
        return state;
    } catch (error) {
        console.error('Failed to load game state:', error);
        return null;
    }
}

/**
 * Clear saved game state
 * WHY: Remove saved state after game ends
 */
export function clearGameState() {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    console.log('🗑️ Game state cleared');
}

/**
 * Restore game state to UI
 * WHY: Recreate game boards and state after refresh
 */
export function restoreGameState(state) {
    // Restore game state object
    gameState.setGameId(state.gameId);
    gameState.setOpponent(state.opponent);
    gameState.setYourTurn(state.yourTurn);
    gameState.setShipsSentToServer(state.shipsSentToServer);
    
    // Restore placed ships
    state.placedShips.forEach(ship => {
        gameState.addShip(ship);
    });
    
    // Restore stats
    gameState.totalHits = state.stats.hits;
    gameState.totalMisses = state.stats.misses;
    
    // Restore board visual states
    restoreBoardState('player-board', state.playerBoardState);
    restoreBoardState('firing-board', state.firingBoardState);
    
    console.log('♻️ Game state restored');
}

/**
 * Capture current state of a board (hits/misses/ships)
 * WHY: Save visual state for restoration
 */
function captureBoardState(boardId) {
    const board = document.getElementById(boardId);
    if (!board) return [];
    
    const tiles = board.querySelectorAll('.tile');
    const state = [];
    
    tiles.forEach(tile => {
        state.push({
            row: tile.dataset.row,
            col: tile.dataset.col,
            classes: tile.className
        });
    });
    
    return state;
}

/**
 * Restore board visual state
 * WHY: Recreate hits/misses/ships after refresh
 */
function restoreBoardState(boardId, state) {
    const board = document.getElementById(boardId);
    if (!board || !state) return;
    
    state.forEach(tileState => {
        const tile = board.querySelector(
            `[data-row="${tileState.row}"][data-col="${tileState.col}"]`
        );
        if (tile) {
            tile.className = tileState.classes;
        }
    });
}

/**
 * Check if game is in progress
 * WHY: Determine if we should show resume prompt
 */
export function hasGameInProgress() {
    const state = loadGameState();
    return state && state.gameId;
}