import { initSocket, sendToServer } from './websocket.js';
import { renderPlayerList, showInvite, showGameScreen } from './lobbyUI.js';

let gameId = null;
let opponent = null;
let yourTurn = false;
let shipsSentToServer = false;

const GRID_SIZE = 12;

const SHIP_DEFINITIONS = [
    { type: 'carrier', length: 5 },
    { type: 'battleship', length: 4 },
    { type: 'cruiser', length: 3 },
    { type: 'submarine', length: 3 },
    { type: 'destroyer', length: 2 }
];

let placedShips = [];
let totalHits = 0;
let totalMisses = 0;

/* =========================
   BOARD CREATION
========================= */

function createBoard(boardElement) {
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

function getTileAt(boardElement, row, col) {
    return boardElement.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );
}

/* =========================
   SHIP PLACEMENT
========================= */

function isShipAtPosition(row, col) {
    return placedShips.some(ship => {
        for (let offset = 0; offset < ship.length; offset++) {
            const shipRow =
                ship.orientation === 'H'
                    ? ship.startRow
                    : ship.startRow + offset;

            const shipCol =
                ship.orientation === 'H'
                    ? ship.startCol + offset
                    : ship.startCol;

            if (shipRow === row && shipCol === col) {
                return true;
            }
        }
        return false;
    });
}

function canPlaceShip(startRow, startCol, length, orientation) {
    for (let offset = 0; offset < length; offset++) {
        const row = orientation === 'H' ? startRow : startRow + offset;
        const col = orientation === 'H' ? startCol + offset : startCol;

        if (row >= GRID_SIZE || col >= GRID_SIZE) return false;
        if (isShipAtPosition(row, col)) return false;
    }
    return true;
}

function placeShipOnBoard(boardElement, ship) {
    for (let offset = 0; offset < ship.length; offset++) {
        const row =
            ship.orientation === 'H'
                ? ship.startRow
                : ship.startRow + offset;

        const col =
            ship.orientation === 'H'
                ? ship.startCol + offset
                : ship.startCol;

        const tile = getTileAt(boardElement, row, col);
        tile.classList.add(ship.type);
    }
}

function clearShips() {
    placedShips = [];
    const playerBoard = document.getElementById("player-board");

    playerBoard.querySelectorAll(".tile").forEach(tile => {
        tile.className = "tile";
    });
}

function placeShipsRandomly() {
    clearShips();
    const playerBoard = document.getElementById("player-board");

    SHIP_DEFINITIONS.forEach(shipDef => {
        let placed = false;

        while (!placed) {
            const orientation = Math.random() > 0.5 ? "H" : "V";
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);

            if (canPlaceShip(row, col, shipDef.length, orientation)) {
                const ship = {
                    type: shipDef.type,
                    length: shipDef.length,
                    startRow: row,
                    startCol: col,
                    orientation
                };

                placedShips.push(ship);
                placeShipOnBoard(playerBoard, ship);
                placed = true;
            }
        }
    });
}

function handlePlayerPlacement(event) {
    const tile = event.target;
    if (!tile.classList.contains('tile')) return;

    if (placedShips.length >= SHIP_DEFINITIONS.length) {
        alert('All ships placed');
        return;
    }

    const shipType = document.getElementById('ship-select').value;
    const orientation = document.getElementById('orientation-select').value;

    if (placedShips.some(s => s.type === shipType)) {
        alert(`${shipType} already placed`);
        return;
    }

    const shipDef = SHIP_DEFINITIONS.find(s => s.type === shipType);
    const startRow = Number(tile.dataset.row);
    const startCol = Number(tile.dataset.col);

    if (!canPlaceShip(startRow, startCol, shipDef.length, orientation)) {
        alert('Invalid placement');
        return;
    }

    const ship = {
        type: shipType,
        length: shipDef.length,
        startRow,
        startCol,
        orientation
    };

    placedShips.push(ship);
    placeShipOnBoard(document.getElementById('player-board'), ship);
}

/* =========================
   FIRING
========================= */

function bindFiringBoardEvents() {
    const firingBoard = document.getElementById('firing-board');

    firingBoard.querySelectorAll('.tile').forEach(tile => {
        tile.addEventListener('click', () => {
            if (!yourTurn || !shipsSentToServer) return;

            const row = Number(tile.dataset.row);
            const col = Number(tile.dataset.col);
            const coordinate = convertToCoordinate(row, col);

            sendToServer({
                type: "shoot",
                coordinate
            });
        });
    });
}

/* =========================
   STATS
========================= */

function updateStats() {
    const accuracy =
        totalHits + totalMisses === 0
            ? 0
            : ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1);

    document.getElementById("hits").textContent = totalHits;
    document.getElementById("misses").textContent = totalMisses;
    document.getElementById("accuracy").textContent = accuracy + "%";
}

/* =========================
   SERVER HANDLER
========================= */

function handleServerMessage(message) {
    console.log("📩 From server:", message);

    switch (message.type) {

        case "auth_success":
            localStorage.setItem("sessionToken", message.sessionToken);
            localStorage.setItem("username", message.user.username);
            sendToServer({ type: "list_players" });
            break;

        case "player_list":
            renderPlayerList(message.players);
            break;

        case "invite_received":
            showInvite(message.from, message.inviteId);
            break;

        case "invite_accepted":
            gameId = message.gameId;
            resetLocalGameState();
            showGameScreen();
            break;

        case "game_start":
            opponent = message.opponent;
            yourTurn = message.yourTurn;
            
            localStorage.setItem("matchStartTime", Date.now());
            
            alert(yourTurn ? "Your turn!" : "Opponent's turn");
            break;


        case "turn_change":
            yourTurn = message.currentTurn === localStorage.getItem("username");
            alert(yourTurn ? "Your turn!" : "Opponent's turn");
            break;

        case "shot_result":
            const shotTile = getTileFromCoordinate(message.coordinate, "firing-board");
            if (shotTile) {
                if (message.hit) totalHits++;
                else totalMisses++;

                shotTile.classList.add(message.hit ? "hit" : "miss");
                updateStats();
            }
            break;

        case "shot_fired":
            const playerTile = getTileFromCoordinate(message.coordinate, "player-board");
            if (playerTile) {
                playerTile.classList.add(message.hit ? "hit" : "miss");
            }
            break;

        case "rematch_requested":
            const accept = confirm(`${message.from} wants a rematch. Accept?`);

            sendToServer({
                type: accept ? "accept_rematch" : "decline_rematch",
                opponent: message.from
            });
            break;
        
        case "rematch_declined":
            alert("Opponent declined the rematch.");
            break;
    

        case "game_over":

            const startTime = localStorage.getItem("matchStartTime");
            const duration = startTime
                ? Math.floor((Date.now() - Number(startTime)) / 1000)
                : 0;

            const matchRecord = {
                id: crypto.randomUUID(),
                date: new Date().toISOString(),
                opponent: opponent,
                winner: message.winner,
                durationSeconds: duration,
                totalShots: totalHits + totalMisses
            };
        
            const history = JSON.parse(
                localStorage.getItem("battleship_match_history") || "[]"
            );
        
            history.push(matchRecord);
        
            localStorage.setItem(
                "battleship_match_history",
                JSON.stringify(history)
            );
        
            alert("Game Over! Winner: " + message.winner);
        
            shipsSentToServer = false;
            yourTurn = false;
            break;

    }
}

/* =========================
   HELPERS
========================= */

function convertToCoordinate(row, col) {
    const letters = "ABCDEFGHIJKL";
    return letters[col] + (row + 1);
}

function getTileFromCoordinate(coord, boardId) {
    const letters = "ABCDEFGHIJKL";
    const col = letters.indexOf(coord[0]);
    const row = parseInt(coord.slice(1)) - 1;

    return document
        .getElementById(boardId)
        .querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

/* =========================
   GAME CONTROL
========================= */

function startBattle() {
    if (placedShips.length !== SHIP_DEFINITIONS.length) {
        alert("Place all ships first");
        return;
    }

    if (shipsSentToServer) return;

    const shipsPayload = placedShips.map(ship => ({
        type: ship.type,
        start: convertToCoordinate(ship.startRow, ship.startCol),
        orientation: ship.orientation === "H" ? "horizontal" : "vertical"
    }));

    sendToServer({
        type: "place_ships",
        ships: shipsPayload
    });

    shipsSentToServer = true;
}

/* =========================
   REQUESTING REMACTCH 
========================= */
function requestRematch() {
    if (!opponent) return;

    sendToServer({
        type: "request_rematch",
        opponent
    });

    alert("Rematch request sent. Waiting for opponent...");
}

function resetLocalGameState() {
    placedShips = [];
    shipsSentToServer = false;
    yourTurn = false;
    totalHits = 0;
    totalMisses = 0;

    createBoard(document.getElementById("player-board"));
    createBoard(document.getElementById("firing-board"));
    bindFiringBoardEvents();
    updateStats();
}

/* =========================
   INIT
========================= */

function startGame() {
    const playerBoard = document.getElementById('player-board');
    const firingBoard = document.getElementById('firing-board');

    createBoard(playerBoard);
    createBoard(firingBoard);

    playerBoard.addEventListener('click', handlePlayerPlacement);
    bindFiringBoardEvents();

    document.getElementById('fire-random')?.addEventListener('click', startBattle);
    document.getElementById('random-ships')?.addEventListener('click', placeShipsRandomly);
    document.getElementById('clear-ships')?.addEventListener('click', clearShips);
    document.getElementById('restart-game')?.addEventListener('click', requestRematch);

    updateStats();
}

document.addEventListener('DOMContentLoaded', () => {
    startGame();
    initSocket(handleServerMessage);
});
