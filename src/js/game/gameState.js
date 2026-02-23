// ============================================
// Game state management for all game state
// ============================================

class GameState {
    constructor() {
        this.gameId = null;
        this.opponent = null;
        this.yourTurn = false;
        this.shipsSentToServer = false;
        this.placedShips = [];
        this.totalHits = 0;
        this.totalMisses = 0;
    }

    // Reset state for new game
    reset() {
        this.placedShips = [];
        this.shipsSentToServer = false;
        this.yourTurn = false;
        this.totalHits = 0;
        this.totalMisses = 0;
    }

    // Getters
    getPlacedShips() {
        return this.placedShips;
    }

    getOpponent() {
        return this.opponent;
    }

    isYourTurn() {
        return this.yourTurn;
    }

    areShipsSent() {
        return this.shipsSentToServer;
    }

    // Setters
    setGameId(id) {
        this.gameId = id;
    }

    setOpponent(name) {
        this.opponent = name;
    }

    setYourTurn(isTurn) {
        this.yourTurn = isTurn;
    }

    setShipsSentToServer(sent) {
        this.shipsSentToServer = sent;
    }

    addShip(ship) {
        this.placedShips.push(ship);
    }

    clearShips() {
        this.placedShips = [];
    }

    incrementHits() {
        this.totalHits++;
    }

    incrementMisses() {
        this.totalMisses++;
    }

    getStats() {
        return {
            hits: this.totalHits,
            misses: this.totalMisses,
            total: this.totalHits + this.totalMisses
        };
    }
}

// Export singleton instance
export const gameState = new GameState();