// ============================================
// Game controller that controls game flow and actions
// ============================================

import { SHIP_DEFINITIONS } from '../config.js';
import { gameState } from './gameState.js';
import { sendToServer } from '../websocket.js';
import { convertToCoordinate } from '../board/boardUtils.js';
import { createBoard } from '../board/boardRenderer.js';
import { updateStats } from '../stats/statsManager.js';
import { showWarning, showSuccess } from '../ui/notificationManager.js';

/**
 * Start battle - send ships to server
 */
export function startBattle() {
    if (gameState.getPlacedShips().length !== SHIP_DEFINITIONS.length) {
        showWarning('Place all 5 ships before starting battle!');
        return;
    }

    if (gameState.areShipsSent()) return;

    const shipsPayload = gameState.getPlacedShips().map(ship => ({
        type: ship.type,
        start: convertToCoordinate(ship.startRow, ship.startCol),
        orientation: ship.orientation === 'H' ? 'horizontal' : 'vertical'
    }));

    sendToServer({
        type: 'place_ships',
        ships: shipsPayload
    });

    gameState.setShipsSentToServer(true);
    showSuccess('Ships sent! Waiting for opponent...');
}

/**
 * Reset game state for new match
 */
export function resetLocalGameState() {
    gameState.reset();

    createBoard(document.getElementById('player-board'));
    createBoard(document.getElementById('firing-board'));
    bindFiringBoardEvents();
    updateStats();
}

/**
 * Bind click events to firing board
 */
export function bindFiringBoardEvents() {
    const firingBoard = document.getElementById('firing-board');

    firingBoard.querySelectorAll('.tile').forEach(tile => {
        tile.addEventListener('click', () => {
            if (!gameState.isYourTurn() || !gameState.areShipsSent()) return;

            const row = Number(tile.dataset.row);
            const col = Number(tile.dataset.col);
            const coordinate = convertToCoordinate(row, col);

            sendToServer({
                type: 'shoot',
                coordinate
            });
        });
    });
}