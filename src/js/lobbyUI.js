import { sendToServer } from './websocket.js';

// Render online players
export function renderPlayerList(players) {
    const container = document.getElementById('online-players');
    container.innerHTML = '';

    players.forEach(player => {
        const div = document.createElement('div');
        div.classList.add('player-row');

        const name = document.createElement('span');
        name.textContent = player.username;

        const inviteBtn = document.createElement('button');
        inviteBtn.textContent = 'Invite';
        inviteBtn.addEventListener('click', () => {
            sendInvite(player.username);
        });

        div.appendChild(name);
        div.appendChild(inviteBtn);
        container.appendChild(div);
    });
}

function sendInvite(username) {
    sendToServer({
        type: "send_invite",
        targetUsername: username
    });
}

// Show invite popup
export function showInvite(fromUser, inviteId) {
    const accepted = confirm(`Invite from ${fromUser}. Accept?`);

    sendToServer({
        type: accepted ? "accept_invite" : "decline_invite",
        inviteId: inviteId
    });
}

// Switch to game screen
export function showGameScreen() {
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
}
