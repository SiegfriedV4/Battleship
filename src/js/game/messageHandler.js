// ============================================
// Message handler that handles all WebSocket messages from server
// ============================================

import { MESSAGE_TYPES, STORAGE_KEYS } from '../config.js';
import { gameState } from './gameState.js';
import { sendToServer } from '../websocket.js';
import { renderPlayerList, showInvite, showGameScreen } from '../lobbyUI.js';
import { getTileFromCoordinate } from '../board/boardUtils.js';
import { updateStats } from '../stats/statsManager.js';
import { saveMatchToHistory, setMatchStartTime, getMatchStartTime } from '../storage/matchHistory.js';
import { resetLocalGameState } from './gameController.js';
import { showTurnNotification, showGameOver, showSuccess } from '../ui/notificationManager.js';
import { handleAuthSuccess, handleAuthError, handleKicked } from '../auth/authManager.js';

/**
 * Main handler for all server messages
 * @param {object} message - Message from server
 */
export function handleServerMessage(message) {
    console.log('📩 From server:', message);

    switch (message.type) {
        case MESSAGE_TYPES.AUTH_SUCCESS:
            handleAuthSuccess(message);
            break;
            
        case MESSAGE_TYPES.AUTH_ERROR:
            handleAuthError(message);
            break;

        case MESSAGE_TYPES.KICKED:
            handleKicked(message);
            break;

        case MESSAGE_TYPES.PLAYER_LIST:
            renderPlayerList(message.players);
            break;

        case MESSAGE_TYPES.INVITE_RECEIVED:
            showInvite(message.from, message.inviteId);
            break;

        case MESSAGE_TYPES.INVITE_ACCEPTED:
            gameState.setGameId(message.gameId);
            resetLocalGameState();
            showGameScreen();
            break;

        case MESSAGE_TYPES.GAME_START:
            handleGameStart(message);
            break;

        case MESSAGE_TYPES.TURN_CHANGE:
            handleTurnChange(message);
            break;

        case MESSAGE_TYPES.SHOT_RESULT:
            handleShotResult(message);
            break;

        case MESSAGE_TYPES.SHOT_FIRED:
            handleShotFired(message);
            break;

        case MESSAGE_TYPES.GAME_OVER:
            handleGameOver(message);
            break;

        case MESSAGE_TYPES.LOGOUT_SUCCESS:
            window.location.reload(); 
            break;     

        case MESSAGE_TYPES.ERROR:
            handleServerError(message);
            break;

        default:
            console.warn('Unknown message type:', message.type);
    }
}

function handleServerError(message) {
    console.error(`Server error [${message.code}]: ${message.message}`);
    alert(message.message);
}

/* ===== Individual message handlers ===== */

function handleGameStart(message) {
    gameState.setOpponent(message.opponent);
    gameState.setYourTurn(message.yourTurn);

    setMatchStartTime(Date.now());

    showTurnNotification(message.yourTurn);
    showSuccess(`Game started! Playing against ${message.opponent}`);
}

function handleTurnChange(message) {
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const isYourTurn = message.currentTurn === username;
    
    gameState.setYourTurn(isYourTurn);
    showTurnNotification(isYourTurn);
}

function handleShotResult(message) {
    const shotTile = getTileFromCoordinate(message.coordinate, 'firing-board');
    if (shotTile) {
        if (message.hit) {
            gameState.incrementHits();
            
            // ⭐ Check if ship was sunk
            if (message.shipType) {
                gameState.recordShipHit(message.shipType);
                
                if (gameState.isShipSunk(message.shipType)) {
                    showSuccess(`🎯 You sunk their ${message.shipType.toUpperCase()}!`);
                }
            }
        } else {
            gameState.incrementMisses();
        }

        shotTile.classList.add(message.hit ? 'hit' : 'miss');
        updateStats();
        saveGameState();
    }
}

function handleShotFired(message) {
    const playerTile = getTileFromCoordinate(message.coordinate, 'player-board');
    if (playerTile) {
        // Add hit or miss marker
        playerTile.classList.add(message.hit ? 'hit' : 'miss');
        
        // Show notification
        if (message.hit) {
            showWarning(`💥 Opponent hit your ${getShipAtPosition(message.coordinate)}!`);
        } else {
            showSuccess('😅 Opponent missed!');
        }
    }
}

// Get ship name at position
function getShipAtPosition(coordinate) {
    const {row, col} = parseCoordinate(coordinate);
    const ships = gameState.getPlacedShips();
    
    for (let ship of ships) {
        for (let i = 0; i < ship.length; i++) {
            const shipRow = ship.orientation === 'H' ? ship.startRow : ship.startRow + i;
            const shipCol = ship.orientation === 'H' ? ship.startCol + i : ship.startCol;
            
            if (shipRow === row && shipCol === col) {
                return ship.type;
            }
        }
    }
    return 'unknown';
}

function handleGameOver(message) {
    const startTime = getMatchStartTime();
    const duration = startTime
        ? Math.floor((Date.now() - Number(startTime)) / 1000)
        : 0;

    const stats = gameState.getStats();

    const matchRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        opponent: gameState.getOpponent(),
        winner: message.winner,
        durationSeconds: duration,
        totalShots: stats.total
    };

    saveMatchToHistory(matchRecord);

    showGameOver(message.winner, stats);

    gameState.setShipsSentToServer(false);
    gameState.setYourTurn(false);
}