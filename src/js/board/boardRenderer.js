// ============================================
// Board rendering that creates and manages game boards
// ============================================

import { GRID_SIZE } from '../config.js';

/**
 * Creates a 12x12 grid of tiles
 * @param {HTMLElement} boardElement - The board container
 */
export function createBoard(boardElement) {
    boardElement.innerHTML = '';

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = row;
            tile.dataset.col = col;
            boardElement.appendChild(tile);
        }
    }
}

/**
 * Get specific tile at row/col position
 * @param {HTMLElement} boardElement - The board container
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {HTMLElement} The tile element
 */
export function getTileAt(boardElement, row, col) {
    return boardElement.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );
}

/**
 * Clear all ship classes from board
 * @param {HTMLElement} boardElement - The board container
 */
export function clearBoardShips(boardElement) {
    boardElement.querySelectorAll('.tile').forEach(tile => {
        tile.className = 'tile';
    });
}