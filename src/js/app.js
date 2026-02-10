/*grid constants*/
const GRID_SIZE = 12;

/*This will be replaced by random placement later*/
const ships = [
    { type: 'carrier', startRow: 2, startCol: 1, length: 5, orientation: 'H' },
    { type: 'battleship', startRow: 5, startCol: 7, length: 4, orientation: 'V' },
    { type: 'cruiser', startRow: 8, startCol: 2, length: 3, orientation: 'H' },
    { type: 'submarine', startRow: 0, startCol: 9, length: 3, orientation: 'V' },
    { type: 'destroyer', startRow: 10, startCol: 5, length: 2, orientation: 'H' }
];

/*Current game before starting*/
let totalHits = 0;
let totalMisses = 0;
let gameStartTimestamp = null;

/*Creating Board */
function createBoard(boardElement) {
    for (let currentRowIndex = 0; currentRowIndex < GRID_SIZE; currentRowIndex++) {
        for (let currentColumnIndex = 0; currentColumnIndex < GRID_SIZE; currentColumnIndex++) {
            const tileElement = document.createElement('div');

            tileElement.className = 'tile';
            tileElement.dataset.row = currentRowIndex;
            tileElement.dataset.col = currentColumnIndex;

            boardElement.appendChild(tileElement);
        }
    }
}

/* Tile helpers*/
function getTileAt(boardElement, rowIndex, columnIndex) {
    return boardElement.querySelector(
        `[data-row="${rowIndex}"][data-col="${columnIndex}"]`
    );
}

/* Ship placement for player board */
function placeShipsOnBoard(boardElement) {
    ships.forEach(ship => {
        for (let shipTileOffset = 0; shipTileOffset < ship.length; shipTileOffset++) {
            const rowIndex =
                ship.orientation === 'H'
                    ? ship.startRow
                    : ship.startRow + shipTileOffset;

            const columnIndex =
                ship.orientation === 'H'
                    ? ship.startCol + shipTileOffset
                    : ship.startCol;

            const tileElement = getTileAt(boardElement, rowIndex, columnIndex);

            if (tileElement) {
                tileElement.classList.add(ship.type);
            }
        }
    });
}

/* Logic for the ship placement*/
function isShipAtPosition(rowIndex, columnIndex) {
    for (let shipIndex = 0; shipIndex < ships.length; shipIndex++) {
        const currentShip = ships[shipIndex];

        for (let shipTileOffset = 0; shipTileOffset < currentShip.length; shipTileOffset++) {
            const shipRow =
                currentShip.orientation === 'H'
                    ? currentShip.startRow
                    : currentShip.startRow + shipTileOffset;

            const shipCol =
                currentShip.orientation === 'H'
                    ? currentShip.startCol + shipTileOffset
                    : currentShip.startCol;

            if (shipRow === rowIndex && shipCol === columnIndex) {
                return true;
            }
        }
    }
    return false;
}

/*Stats displaying */
function updateStatsDisplay() {
    document.getElementById('hits').textContent = totalHits;
    document.getElementById('misses').textContent = totalMisses;

    const totalShots = totalHits + totalMisses;
    const accuracyPercentage =
        totalShots === 0 ? 0 : ((totalHits / totalShots) * 100).toFixed(1);

    document.getElementById('accuracy').textContent = accuracyPercentage + '%';
}

/*Logic for Firing */
function fireAtTile(tileElement) {
    if (
        tileElement.classList.contains('hit') ||
        tileElement.classList.contains('miss')
    ) {
        return;
    }

    const rowIndex = Number(tileElement.dataset.row);
    const columnIndex = Number(tileElement.dataset.col);

    if (isShipAtPosition(rowIndex, columnIndex)) {
        tileElement.classList.add('hit');
        totalHits++;
    } else {
        tileElement.classList.add('miss');
        totalMisses++;
    }

    updateStatsDisplay();
    checkWinCondition();
}

/* Randomis firing when clicked */
function fireRandomShot() {
    const firingBoard = document.getElementById('firing-board');
    const allTiles = Array.from(firingBoard.querySelectorAll('.tile'));

    const availableTiles = allTiles.filter(tile =>
        !tile.classList.contains('hit') &&
        !tile.classList.contains('miss')
    );

    if (availableTiles.length === 0) {
        return;
    }

    const randomTileIndex = Math.floor(Math.random() * availableTiles.length);
    fireAtTile(availableTiles[randomTileIndex]);
}

/* Checking for the win*/
function checkWinCondition() {
    const totalShipTiles = ships.reduce(
        (runningTotal, ship) => runningTotal + ship.length,
        0
    );

    if (totalHits === totalShipTiles) {
        alert('🎉 Victory! All ships destroyed!');
    }
}

/* Game starting*/
function startGame() {
    const playerBoard = document.getElementById('player-board');
    const firingBoard = document.getElementById('firing-board');

    createBoard(playerBoard);
    createBoard(firingBoard);

    placeShipsOnBoard(playerBoard);

    const firingTiles = firingBoard.querySelectorAll('.tile');
    firingTiles.forEach(tile => {
        tile.addEventListener('click', () => fireAtTile(tile));
    });

    document
        .getElementById('fire-random')
        .addEventListener('click', fireRandomShot);

    totalHits = 0;
    totalMisses = 0;
    gameStartTimestamp = Date.now();

    updateStatsDisplay();
}

/* Initiating Game*/
document.addEventListener('DOMContentLoaded', startGame);
