// ============================================
// Notification manager for UI notifications used by players
// ============================================

let currentNotification = null;

/**
 * Show a notification message
 * @param {string} message - Message to display
 * @param {string} type - 'info', 'success', 'warning', 'error', 'turn'
 * @param {number} duration - Auto-hide after milliseconds (0 = don't auto-hide)
 */
export function showNotification(message, type = 'info', duration = 5000) {
    const container = getOrCreateContainer();
    
    // Clear existing notification
    if (currentNotification) {
        currentNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `game-notification ${type}`;
    notification.textContent = message;

    currentNotification = notification;
    container.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            hideNotification();
        }, duration);
    }
}

/**
 * Hide current notification
 */
export function hideNotification() {
    if (currentNotification) {
        currentNotification.classList.remove('show');
        
        setTimeout(() => {
            if (currentNotification) {
                currentNotification.remove();
                currentNotification = null;
            }
        }, 300); // Match CSS transition time
    }
}

/**
 * Show turn notification
 * @param {boolean} isYourTurn - True if it's player's turn
 */
export function showTurnNotification(isYourTurn) {
    const message = isYourTurn 
        ? '🎯 Your Turn! Click on the target grid to fire.'
        : '⏳ Opponent\'s Turn... Please wait.';
    
    showNotification(message, 'turn', 0); // Don't auto-hide
}

/**
 * Show game status
 * @param {string} status - Status message
 */
export function showGameStatus(status) {
    showNotification(status, 'info', 0);
}

/**
 * Show success message
 * @param {string} message - Success message
 */
export function showSuccess(message) {
    showNotification(message, 'success', 3000);
}

/**
 * Show warning message
 * @param {string} message - Warning message
 */
export function showWarning(message) {
    showNotification(message, 'warning', 4000);
}

/**
 * Show error message
 * @param {string} message - Error message
 */
export function showError(message) {
    showNotification(message, 'error', 5000);
}

/**
 * Show winner announcement
 * @param {string} winner - Winner's name
 * @param {object} stats - Game statistics
 */
export function showGameOver(winner, stats) {
    const username = localStorage.getItem('username');
    const isWinner = winner === username;
    
    const message = isWinner
        ? `🎉 Victory! You won in ${stats.totalShots} shots!`
        : `💔 Defeat! ${winner} won the match.`;
    
    showNotification(message, isWinner ? 'success' : 'error', 10000);
}

/**
 * Get or create notification container
 * @returns {HTMLElement} Notification container
 */
function getOrCreateContainer() {
    let container = document.getElementById('notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    
    return container;
}

/**
 * Initialize notification system
 * Call this on page load
 */
export function initNotifications() {
    getOrCreateContainer();
}