// ============================================
// Ship renderer that draws ships on the board
// ============================================

import { getTileAt } from '../board/boardRenderer.js';

/**
 * Draw a ship on the board
 * @param {HTMLElement} boardElement - The board container
 * @param {object} ship - Ship object with type, startRow, startCol, length, orientation
 */
export function placeShipOnBoard(boardElement, ship) {
    for (let offset = 0; offset < ship.length; offset++) {
        const row =
            ship.orientation === 'H'
                ? ship.startRow
                : ship.startRow + offset;

        const col =
            ship.orientation === 'H'
                ? ship.startCol + offset
                : ship.startCol;

        const tile = getTileAt(boardElement, row, col);
        if (tile) {
            tile.classList.add(ship.type);
        }
    }
}

/**
 * Remove ship visual from board
 * @param {HTMLElement} boardElement - The board container
 * @param {object} ship - Ship to remove
 */
export function removeShipFromBoard(boardElement, ship) {
    for (let offset = 0; offset < ship.length; offset++) {
        const row =
            ship.orientation === 'H'
                ? ship.startRow
                : ship.startRow + offset;

        const col =
            ship.orientation === 'H'
                ? ship.startCol + offset
                : ship.startCol;

        const tile = getTileAt(boardElement, row, col);
        if (tile) {
            tile.classList.remove(ship.type);
        }
    }
}