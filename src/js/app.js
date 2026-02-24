// ============================================
// Main entry that initializes the game with authentication
// ============================================

import { initSocket } from './websocket.js';
import { handleServerMessage } from './game/messageHandler.js';
import { createBoard } from './board/boardRenderer.js';
import { handlePlayerPlacement, clearShips, placeShipsRandomly } from './ships/shipPlacement.js';
import { startBattle, bindFiringBoardEvents } from './game/gameController.js';
import { updateStats } from './stats/statsManager.js';
import { initNotifications } from './ui/notificationManager.js';
import { isLoggedIn, shouldRemember } from './auth/authManager.js';
import { showLoginScreen, hideAuthScreen } from './auth/authUI.js';
import { initNavigation } from './ui/navigationUI.js';
import { sendToServer } from './websocket.js';

/**
 * Initialize lobby after login
 * WHY: User needs to see online players and send invites
 */
function initLobby() {
    // Request list of online players
    sendToServer({ type: 'list_players' });
    
    // Bind "Practice Locally" button
    const playLocalBtn = document.getElementById('play-local-btn');
    playLocalBtn?.addEventListener('click', () => {
        startGame();
        gameState.setGameId('local-' + Date.now()); // Unique ID for local game
    });
    
    initNavigation();
}

/**
 * Initialize game when game starts (after invite accepted)
 * WHY: Set up boards and controls for actual gameplay
 */
function startGame() {
    // Hide lobby, show game screen
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    const playerBoard = document.getElementById('player-board');
    const firingBoard = document.getElementById('firing-board');

    // Create boards
    createBoard(playerBoard);
    createBoard(firingBoard);

    // Bind events
    playerBoard.addEventListener('click', handlePlayerPlacement);
    bindFiringBoardEvents();

    // Button events
    document.getElementById('fire-random')?.addEventListener('click', startBattle);
    document.getElementById('random-ships')?.addEventListener('click', placeShipsRandomly);
    document.getElementById('clear-ships')?.addEventListener('click', clearShips);

    // Initialize stats
    updateStats();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initNotifications();
    
    // Check for saved game first
    if (hasGameInProgress()) {
        const resume = confirm('Resume your previous game?');
        if (resume) {
            const savedState = loadGameState();
            hideAuthScreen();
            showGameScreen();  // Skip lobby, go straight to game
            initNavigation();
            restoreGameState(savedState);
            initSocket(handleServerMessage);
            return;
        } else {
            clearGameState();
        }
    }
    
    // Normal login flow...
    if (isLoggedIn() && shouldRemember()) {
        hideAuthScreen();
        initLobby();
        initSocket(handleServerMessage);
    } else {
        showLoginScreen();
        initSocket(handleServerMessage);
    }
    
    window.addEventListener('auth-success', () => {
        initLobby();
    });
});

// Export startGame so lobbyUI can call it
export { startGame };