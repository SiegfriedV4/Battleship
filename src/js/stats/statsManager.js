// ============================================
// Stats manager that tracks and displays game statistics
// ============================================

import { gameState } from '../game/gameState.js';

/**
 * Update stats display on UI
 */
export function updateStats() {
    const stats = gameState.getStats();
    
    const accuracy =
        stats.total === 0
            ? 0
            : ((stats.hits / stats.total) * 100).toFixed(1);

    document.getElementById('hits').textContent = stats.hits;
    document.getElementById('misses').textContent = stats.misses;
    document.getElementById('accuracy').textContent = accuracy + '%';
}