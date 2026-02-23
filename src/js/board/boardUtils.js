// ============================================
// Board utilities for coordinate conversion helpers
// ============================================

import { COORDINATE_LETTERS } from '../config.js';

/**
 * Convert row/col to coordinate string (e.g., A1, B5)
 * @param {number} row - Row index (0-11)
 * @param {number} col - Column index (0-11)
 * @returns {string} Coordinate string (e.g., "A1")
 */
export function convertToCoordinate(row, col) {
    return COORDINATE_LETTERS[col] + (row + 1);
}

/**
 * Convert coordinate string to row/col
 * @param {string} coord - Coordinate string (e.g., "A1")
 * @returns {object} Object with row and col properties
 */
export function parseCoordinate(coord) {
    const col = COORDINATE_LETTERS.indexOf(coord[0]);
    const row = parseInt(coord.slice(1)) - 1;
    return { row, col };
}

/**
 * Get tile element from coordinate string
 * @param {string} coord - Coordinate string (e.g., "A1")
 * @param {string} boardId - ID of the board element
 * @returns {HTMLElement} The tile element
 */
export function getTileFromCoordinate(coord, boardId) {
    const { row, col } = parseCoordinate(coord);
    
    return document
        .getElementById(boardId)
        .querySelector(`[data-row="${row}"][data-col="${col}"]`);
}