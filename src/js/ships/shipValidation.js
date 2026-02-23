// ============================================
// Ship validation that checks if ship placement is valid
// ============================================

import { GRID_SIZE } from '../config.js';
import { gameState } from '../game/gameState.js';

/**
 * Check if a ship exists at given position
 * @param {number} row - Row to check
 * @param {number} col - Column to check
 * @returns {boolean} True if ship exists at position
 */
export function isShipAtPosition(row, col) {
    const placedShips = gameState.getPlacedShips();
    
    return placedShips.some(ship => {
        for (let offset = 0; offset < ship.length; offset++) {
            const shipRow =
                ship.orientation === 'H'
                    ? ship.startRow
                    : ship.startRow + offset;

            const shipCol =
                ship.orientation === 'H'
                    ? ship.startCol + offset
                    : ship.startCol;

            if (shipRow === row && shipCol === col) {
                return true;
            }
        }
        return false;
    });
}

/**
 * Check if ship can be placed at position
 * @param {number} startRow - Starting row
 * @param {number} startCol - Starting column
 * @param {number} length - Ship length
 * @param {string} orientation - 'H' or 'V'
 * @returns {boolean} True if placement is valid
 */
export function canPlaceShip(startRow, startCol, length, orientation) {
    for (let offset = 0; offset < length; offset++) {
        const row = orientation === 'H' ? startRow : startRow + offset;
        const col = orientation === 'H' ? startCol + offset : startCol;

        // Check boundaries
        if (row >= GRID_SIZE || col >= GRID_SIZE) return false;
        
        // Check overlaps
        if (isShipAtPosition(row, col)) return false;
    }
    return true;
}

/**
 * Check if ship type is already placed
 * @param {string} shipType - Type of ship to check
 * @returns {boolean} True if ship already placed
 */
export function isShipAlreadyPlaced(shipType) {
    const placedShips = gameState.getPlacedShips();
    return placedShips.some(s => s.type === shipType);
}