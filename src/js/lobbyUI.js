// ============================================
// Lobby UI that display online players and handle invites
// ============================================

import { sendToServer } from './websocket.js';
import { startGame } from './app.js';

/**
 * Render online players list
 * WHY: Show available players to challenge
 */
export function renderPlayerList(players) {
    const container = document.getElementById('online-players');
    if (!container) return;
    
    container.innerHTML = '';

    if (players.length === 0) {
        container.innerHTML = '<p class="no-players">No other players online. Invite a friend!</p>';
        return;
    }

    players.forEach(player => {
        const div = document.createElement('div');
        div.classList.add('player-row');

        const name = document.createElement('span');
        name.classList.add('player-name');
        name.textContent = player.username;
        
        const stats = document.createElement('span');
        stats.classList.add('player-stats');
        stats.textContent = `${player.stats.wins}W - ${player.stats.losses}L`;

        const inviteBtn = document.createElement('button');
        inviteBtn.textContent = '⚔️ Challenge';
        inviteBtn.classList.add('invite-btn');
        inviteBtn.addEventListener('click', () => {
            sendInvite(player.username);
        });

        div.appendChild(name);
        div.appendChild(stats);
        div.appendChild(inviteBtn);
        container.appendChild(div);
    });
}

/**
 * Send invite to player
 */
function sendInvite(username) {
    sendToServer({
        type: "send_invite",
        targetUsername: username
    });
}

/**
 * Show invite popup
 * WHY: Let user accept/decline challenges
 */
export function showInvite(fromUser, inviteId) {
    const accepted = confirm(`⚔️ ${fromUser} challenges you to battle! Accept?`);

    sendToServer({
        type: accepted ? "accept_invite" : "decline_invite",
        inviteId: inviteId
    });
}

/**
 * Show game screen after invite accepted
 * WHY: Both players need to place ships
 */
export function showGameScreen() {
    startGame();  // Call the startGame function from app.js
}