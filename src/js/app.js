/* =========================
   GRID & SHIP CONSTANTS
========================= */

const GRID_SIZE = 12;

const SHIP_DEFINITIONS = [
    { type: 'carrier', length: 5 },
    { type: 'battleship', length: 4 },
    { type: 'cruiser', length: 3 },
    { type: 'submarine', length: 3 },
    { type: 'destroyer', length: 2 }
];

/* =========================
   GAME STATE
========================= */

let placedShips = [];
let totalHits = 0;
let totalMisses = 0;
let gameHasStarted = false;

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
   SHIP PLACEMENT LOGIC
========================= */

function canPlaceShip(startRow, startCol, length, orientation) {
    for (let offset = 0; offset < length; offset++) {
        const row =
            orientation === 'H' ? startRow : startRow + offset;
        const col =
            orientation === 'H' ? startCol + offset : startCol;

        if (row >= GRID_SIZE || col >= GRID_SIZE) {
            return false;
        }

        if (isShipAtPosition(row, col)) {
            return false;
        }
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

/* =========================
   PLAYER SHIP PLACEMENT
========================= */

function isShipAlreadyPlaced(shipType) {
    return placedShips.some(ship => ship.type === shipType);
}

function handlePlayerPlacement(event) {
    if (gameHasStarted) return;

    const tile = event.target;
    if (!tile.classList.contains('tile')) return;

    if (placedShips.length >= SHIP_DEFINITIONS.length) {
        alert('⚠ All ships have already been placed');
        return;
    }

    const shipType = document.getElementById('ship-select').value;
    const orientation = document.getElementById('orientation-select').value;

    if (isShipAlreadyPlaced(shipType)) {
        alert(`⚠ ${shipType} already placed`);
        return;
    }

    const shipDefinition = SHIP_DEFINITIONS.find(
        ship => ship.type === shipType
    );

    const startRow = Number(tile.dataset.row);
    const startCol = Number(tile.dataset.col);

    if (
        !canPlaceShip(
            startRow,
            startCol,
            shipDefinition.length,
            orientation
        )
    ) {
        alert('❌ Invalid placement');
        return;
    }

    const ship = {
        type: shipType,
        length: shipDefinition.length,
        startRow,
        startCol,
        orientation
    };

    placedShips.push(ship);
    placeShipOnBoard(
        document.getElementById('player-board'),
        ship
    );
}
/* Helper  to rebind the click listeners */
function bindFiringBoardEvents() {
    const firingBoard = document.getElementById('firing-board');

    firingBoard.querySelectorAll('.tile').forEach(tile => {
        tile.addEventListener('click', () => fireAtTile(tile));
    });
}

/* =========================
   CLEAR & RANDOM PLACEMENT
========================= */

function clearAllShips() {
    placedShips = [];
    gameHasStarted = false;
    totalHits = 0;
    totalMisses = 0;

    createBoard(document.getElementById('player-board'));
    createBoard(document.getElementById('firing-board'));

    bindFiringBoardEvents();
    updateStatsDisplay();
}

function placeShipsRandomly() {
    clearAllShips();

    const board = document.getElementById('player-board');

    SHIP_DEFINITIONS.forEach(shipDef => {
        let placed = false;

        while (!placed) {
            const orientation = Math.random() < 0.5 ? 'H' : 'V';
            const startRow = Math.floor(Math.random() * GRID_SIZE);
            const startCol = Math.floor(Math.random() * GRID_SIZE);

            if (
                canPlaceShip(
                    startRow,
                    startCol,
                    shipDef.length,
                    orientation
                )
            ) {
                const ship = {
                    type: shipDef.type,
                    length: shipDef.length,
                    startRow,
                    startCol,
                    orientation
                };

                placedShips.push(ship);
                placeShipOnBoard(board, ship);
                placed = true;
            }
        }
    });
}

/* =========================
   FIRING LOGIC
========================= */

function fireAtTile(tile) {
    if (!gameHasStarted) return;

    if (
        tile.classList.contains('hit') ||
        tile.classList.contains('miss')
    ) {
        return;
    }

    const row = Number(tile.dataset.row);
    const col = Number(tile.dataset.col);

    if (isShipAtPosition(row, col)) {
        tile.classList.add('hit');
        totalHits++;
    } else {
        tile.classList.add('miss');
        totalMisses++;
    }

    updateStatsDisplay();
    checkWinCondition();
}

function fireRandomShot() {
    const firingBoard = document.getElementById('firing-board');
    const tiles = Array.from(firingBoard.querySelectorAll('.tile'));

    const availableTiles = tiles.filter(
        tile =>
            !tile.classList.contains('hit') &&
            !tile.classList.contains('miss')
    );

    if (availableTiles.length === 0) return;

    const randomTile =
        availableTiles[
            Math.floor(Math.random() * availableTiles.length)
        ];

    fireAtTile(randomTile);
}

/* =========================
   STATS & GAME FLOW
========================= */

function updateStatsDisplay() {
    document.getElementById('hits').textContent = totalHits;
    document.getElementById('misses').textContent = totalMisses;

    const totalShots = totalHits + totalMisses;
    const accuracy =
        totalShots === 0
            ? 0
            : ((totalHits / totalShots) * 100).toFixed(1);

    document.getElementById('accuracy').textContent = accuracy + '%';
}

function checkWinCondition() {
    const totalShipTiles = placedShips.reduce(
        (sum, ship) => sum + ship.length,
        0
    );

    if (totalHits === totalShipTiles) {
        alert('🎉 Victory! All ships destroyed!');
    }
}

function startBattle() {
    if (placedShips.length !== SHIP_DEFINITIONS.length) {
        alert('⚠ Place all 5 ships before starting');
        return;
    }

    gameHasStarted = true;
    alert('🔥 Battle started!');
}

/* =========================
   GAME INITIALISATION
========================= */

function startGame() {
    const playerBoard = document.getElementById('player-board');
    const firingBoard = document.getElementById('firing-board');

    createBoard(playerBoard);
    createBoard(firingBoard);

    playerBoard.addEventListener('click', handlePlayerPlacement);

    bindFiringBoardEvents();

    document
        .getElementById('clear-ships')
        .addEventListener('click', clearAllShips);

    document
        .getElementById('random-ships')
        .addEventListener('click', placeShipsRandomly);

    document
        .getElementById('fire-random')
        .addEventListener('click', () => {
            if (!gameHasStarted) {
                startBattle();
            } else {
                fireRandomShot();
            }
        });

    updateStatsDisplay();
}

document.addEventListener('DOMContentLoaded', startGame);