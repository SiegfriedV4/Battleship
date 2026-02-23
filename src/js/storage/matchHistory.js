// ============================================
// Match History localStorage operations for match records
// ============================================

import { STORAGE_KEYS } from '../config.js';

/**
 * Save match record to localStorage
 * @param {object} matchRecord - Match data to save
 */
export function saveMatchToHistory(matchRecord) {
    const history = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY) || '[]'
    );

    history.push(matchRecord);

    localStorage.setItem(
        STORAGE_KEYS.MATCH_HISTORY,
        JSON.stringify(history)
    );
}

/**
 * Get all match history
 * @returns {Array} Array of match records
 */
export function getMatchHistory() {
    return JSON.parse(
        localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY) || '[]'
    );
}

/**
 * Clear all match history
 */
export function clearMatchHistory() {
    localStorage.removeItem(STORAGE_KEYS.MATCH_HISTORY);
}

/**
 * Get match start time
 * @returns {number} Timestamp when match started
 */
export function getMatchStartTime() {
    return localStorage.getItem(STORAGE_KEYS.MATCH_START_TIME);
}

/**
 * Set match start time
 * @param {number} timestamp - Timestamp to save
 */
export function setMatchStartTime(timestamp) {
    localStorage.setItem(STORAGE_KEYS.MATCH_START_TIME, timestamp);
}