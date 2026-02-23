// ============================================
// Main entry that initializes the game
// ============================================

import { initSocket } from './websocket.js';
import { handleServerMessage } from './game/messageHandler.js';
import { createBoard } from './board/boardRenderer.js';
import { handlePlayerPlacement, clearShips, placeShipsRandomly } from './ships/shipPlacement.js';
import { startBattle, bindFiringBoardEvents } from './game/gameController.js';
import { updateStats } from './stats/statsManager.js';
import { initNotifications } from './ui/notificationManager.js';

/**
 * Initialize game when page loads
 */
function startGame() {
    const playerBoard = document.getElementById('player-board');
    const firingBoard = document.getElementById('firing-board');

    // Create boards
    createBoard(playerBoard);
    createBoard(firingBoard);

    // Bind events
    playerBoard.addEventListener('click', handlePlayerPlacement);
    bindFiringBoardEvents();

    // Button events
    document.getElementById('fire-random')?.addEventListener('click', startBattle);
    document.getElementById('random-ships')?.addEventListener('click', placeShipsRandomly);
    document.getElementById('clear-ships')?.addEventListener('click', clearShips);

    // Initialize stats
    updateStats();
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initNotifications(); // Initialize notification system
    startGame();
    initSocket(handleServerMessage);
});