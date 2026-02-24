// ============================================
// Ship placement that handles ship placement logic
// ============================================

import { SHIP_DEFINITIONS } from '../config.js';
import { gameState } from '../game/gameState.js';
import { canPlaceShip, isShipAlreadyPlaced } from './shipValidation.js';
import { placeShipOnBoard } from './shipRenderer.js';
import { clearBoardShips } from '../board/boardRenderer.js';
import { showWarning, showSuccess } from '../ui/notificationManager.js';

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
    
    showSuccess('All ships placed randomly! Click "Fire" to start battle.');
}

/**
 * Handle manual ship placement by clicking
 * @param {Event} event - Click event on board tile
 */
export function handlePlayerPlacement(event) {
    const tile = event.target;
    if (!tile.classList.contains('tile')) return;

    if (gameState.getPlacedShips().length >= SHIP_DEFINITIONS.length) {
        showWarning('All ships already placed!');
        return;
    }

    const shipType = document.getElementById('ship-select').value;
    const orientation = document.getElementById('orientation-select').value;

    if (isShipAlreadyPlaced(shipType)) {
        showWarning(`${shipType} is already placed. Select a different ship.`);
        return;
    }

    const shipDef = SHIP_DEFINITIONS.find(s => s.type === shipType);
    const startRow = Number(tile.dataset.row);
    const startCol = Number(tile.dataset.col);

    if (!canPlaceShip(startRow, startCol, shipDef.length, orientation)) {
        showWarning('Cannot place ship here! Try a different position.');
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
    
    updateShipDropdown(); // Disable placed ship in dropdown

    const remaining = SHIP_DEFINITIONS.length - gameState.getPlacedShips().length;
    if (remaining === 0) {
        showSuccess('All ships placed! Click "Fire" to start battle.');
    } else {
        showSuccess(`${shipType} placed! ${remaining} ship(s) remaining.`);
    }
}

// Update dropdown to show placed ships
function updateShipDropdown() {
    const select = document.getElementById('ship-select');
    const placedShips = gameState.getPlacedShips();
    
    // Clear and rebuild options
    select.innerHTML = '';
    
    SHIP_DEFINITIONS.forEach(shipDef => {
        const isPlaced = placedShips.some(s => s.type === shipDef.type);
        const option = document.createElement('option');
        option.value = shipDef.type;
        option.textContent = isPlaced 
            ? `${shipDef.type} (PLACED ✓)` 
            : `${capitalizeFirst(shipDef.type)} (${shipDef.length} tiles)`;
        option.disabled = isPlaced;  // ⭐ Disable if placed
        select.appendChild(option);
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}