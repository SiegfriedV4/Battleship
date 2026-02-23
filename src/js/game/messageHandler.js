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

        default:
            console.warn('Unknown message type:', message.type);
    }
}

/* ===== Individual message handlers ===== */

function handleAuthSuccess(message) {
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, message.sessionToken);
    localStorage.setItem(STORAGE_KEYS.USERNAME, message.user.username);
    sendToServer({ type: 'list_players' });
}

function handleGameStart(message) {
    gameState.setOpponent(message.opponent);
    gameState.setYourTurn(message.yourTurn);

    setMatchStartTime(Date.now());

    alert(message.yourTurn ? 'Your turn!' : "Opponent's turn");
}

function handleTurnChange(message) {
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const isYourTurn = message.currentTurn === username;
    
    gameState.setYourTurn(isYourTurn);
    alert(isYourTurn ? 'Your turn!' : "Opponent's turn");
}

function handleShotResult(message) {
    const shotTile = getTileFromCoordinate(message.coordinate, 'firing-board');
    if (shotTile) {
        if (message.hit) {
            gameState.incrementHits();
        } else {
            gameState.incrementMisses();
        }

        shotTile.classList.add(message.hit ? 'hit' : 'miss');
        updateStats();
    }
}

function handleShotFired(message) {
    const playerTile = getTileFromCoordinate(message.coordinate, 'player-board');
    if (playerTile) {
        playerTile.classList.add(message.hit ? 'hit' : 'miss');
    }
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

    alert('Game Over! Winner: ' + message.winner);

    gameState.setShipsSentToServer(false);
    gameState.setYourTurn(false);
}