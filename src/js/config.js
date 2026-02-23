// ============================================
// Game config with constants and settings for Battleship game
// ============================================

export const GRID_SIZE = 12;

export const SHIP_DEFINITIONS = [
    { type: 'carrier', length: 5 },
    { type: 'battleship', length: 4 },
    { type: 'cruiser', length: 3 },
    { type: 'submarine', length: 3 },
    { type: 'destroyer', length: 2 }
];

export const COORDINATE_LETTERS = 'ABCDEFGHIJKL';

export const STORAGE_KEYS = {
    SESSION_TOKEN: 'sessionToken',
    USERNAME: 'username',
    MATCH_START_TIME: 'matchStartTime',
    MATCH_HISTORY: 'battleship_match_history'
};

export const MESSAGE_TYPES = {
    AUTH_SUCCESS: 'auth_success',
    PLAYER_LIST: 'player_list',
    INVITE_RECEIVED: 'invite_received',
    INVITE_ACCEPTED: 'invite_accepted',
    GAME_START: 'game_start',
    TURN_CHANGE: 'turn_change',
    SHOT_RESULT: 'shot_result',
    SHOT_FIRED: 'shot_fired',
    GAME_OVER: 'game_over'
};