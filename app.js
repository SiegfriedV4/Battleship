// Constants
const GRID_SIZE = 12;

// Ship placements row, col, orientation hardcoded at thr moment and needs to change
const SHIPS = [
    { type: 'carrier', row: 2, col: 1, length: 5, orientation: 'H' },
    { type: 'battleship', row: 5, col: 7, length: 4, orientation: 'V' },
    { type: 'cruiser', row: 8, col: 2, length: 3, orientation: 'H' },
    { type: 'submarine', row: 0, col: 9, length: 3, orientation: 'V' },
    { type: 'destroyer', row: 10, col: 5, length: 2, orientation: 'H' }
];

// Game state - track hits and misses dynamically
let hitCount = 0;
let missCount = 0;
let gameStartTime = Date.now();

// Save match to localStorage (same function used in history.js)
function saveMatch(match) {
    const matches = JSON.parse(localStorage.getItem('battleship_matches') || '[]');
    matches.unshift(match);
    
    // Keep only 20 matches
    if (matches.length > 20) {
        matches.pop();
    }
    
    localStorage.setItem('battleship_matches', JSON.stringify(matches));
}

// Create game board
function createBoard(boardElement) {
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

// Get tile at position
function getTile(board, row, col) {
    return board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

// Place ships on player board
function placeShips(board) {
    SHIPS.forEach(ship => {
        for (let i = 0; i < ship.length; i++) {
            const row = ship.orientation === 'H' ? ship.row : ship.row + i;
            const col = ship.orientation === 'H' ? ship.col + i : ship.col;
            const tile = getTile(board, row, col);
            if (tile) {
                tile.classList.add(ship.type);
            }
        }
    });
}

// Check if a position has a ship
function isShipAt(row, col) {
    for (let ship of SHIPS) {
        for (let i = 0; i < ship.length; i++) {
            const shipRow = ship.orientation === 'H' ? ship.row : ship.row + i;
            const shipCol = ship.orientation === 'H' ? ship.col + i : ship.col;
            
            if (shipRow === row && shipCol === col) {
                return true;
            }
        }
    }
    return false;
}

// Update stats display
function updateStats() {
    document.getElementById('hits').textContent = hitCount;
    document.getElementById('misses').textContent = missCount;
    
    const totalShots = hitCount + missCount;
    const accuracy = totalShots > 0 ? ((hitCount / totalShots) * 100).toFixed(1) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
}

// Check if all ships are sunk
function checkWinCondition() {
    const totalShipTiles = SHIPS.reduce((sum, ship) => sum + ship.length, 0);
    
    if (hitCount === totalShipTiles) {
        const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(gameDuration / 60);
        const seconds = gameDuration % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const totalShots = hitCount + missCount;
        const accuracy = ((hitCount / totalShots) * 100).toFixed(1);
        
        // Save match to history
        saveMatch({
            result: 'win',
            shots: totalShots,
            hits: hitCount,
            accuracy: accuracy,
            duration: timeString,
            shipsSunk: '5/5',
            date: new Date().toISOString()
        });
        
        setTimeout(() => {
            alert(`🎉 VICTORY! All enemy ships destroyed!\n\nStats:\nShots: ${totalShots}\nHits: ${hitCount}\nAccuracy: ${accuracy}%\nTime: ${timeString}`);
        }, 500);
    }
}

// Handle tile click on firing board
function handleTileClick(event) {
    const tile = event.target;
    
    // Prevent clicking the same tile twice
    if (tile.classList.contains('hit') || tile.classList.contains('miss')) {
        return;
    }
    
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);
    
    // Check if there's a ship at this position
    if (isShipAt(row, col)) {
        tile.classList.add('hit');
        hitCount++;
        checkWinCondition();
    } else {
        tile.classList.add('miss');
        missCount++;
    }
    
    updateStats();
}

// Initialize game
function init() {
    const playerBoard = document.getElementById('player-board');
    const firingBoard = document.getElementById('firing-board');

    createBoard(playerBoard);
    createBoard(firingBoard);
    
    placeShips(playerBoard);
    
    // Add click listeners to firing board tiles
    const firingTiles = firingBoard.querySelectorAll('.tile');
    firingTiles.forEach(tile => {
        tile.addEventListener('click', handleTileClick);
    });
    
    // Initialize stats display
    updateStats();
}

// Start game when page loads
document.addEventListener('DOMContentLoaded', init);