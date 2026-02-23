// ============================================
// Ship placement that handles ship placement logic
// ============================================

import { SHIP_DEFINITIONS } from '../config.js';
import { gameState } from '../game/gameState.js';
import { canPlaceShip, isShipAlreadyPlaced } from './shipValidation.js';
import { placeShipOnBoard } from './shipRenderer.js';
import { clearBoardShips } from '../board/boardRenderer.js';

/**
 * Clear all ships from board and state
 */
export function clearShips() {
    gameState.clearShips();
    const playerBoard = document.getElementById('player-board');
    clearBoardShips(playerBoard);
}

/**
 * Place ships randomly on board
 */
export function placeShipsRandomly() {
    clearShips();
    const playerBoard = document.getElementById('player-board');

    SHIP_DEFINITIONS.forEach(shipDef => {
        let placed = false;

        while (!placed) {
            const orientation = Math.random() > 0.5 ? 'H' : 'V';
            const row = Math.floor(Math.random() * 12);
            const col = Math.floor(Math.random() * 12);

            if (canPlaceShip(row, col, shipDef.length, orientation)) {
                const ship = {
                    type: shipDef.type,
                    length: shipDef.length,
                    startRow: row,
                    startCol: col,
                    orientation
                };

                gameState.addShip(ship);
                placeShipOnBoard(playerBoard, ship);
                placed = true;
            }
        }
    });
}

/**
 * Handle manual ship placement by clicking
 * @param {Event} event - Click event on board tile
 */
export function handlePlayerPlacement(event) {
    const tile = event.target;
    if (!tile.classList.contains('tile')) return;

    if (gameState.getPlacedShips().length >= SHIP_DEFINITIONS.length) {
        alert('All ships placed');
        return;
    }

    const shipType = document.getElementById('ship-select').value;
    const orientation = document.getElementById('orientation-select').value;

    if (isShipAlreadyPlaced(shipType)) {
        alert(`${shipType} already placed`);
        return;
    }

    const shipDef = SHIP_DEFINITIONS.find(s => s.type === shipType);
    const startRow = Number(tile.dataset.row);
    const startCol = Number(tile.dataset.col);

    if (!canPlaceShip(startRow, startCol, shipDef.length, orientation)) {
        alert('Invalid placement');
        return;
    }

    const ship = {
        type: shipType,
        length: shipDef.length,
        startRow,
        startCol,
        orientation
    };

    gameState.addShip(ship);
    placeShipOnBoard(document.getElementById('player-board'), ship);
}