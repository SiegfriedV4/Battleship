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

// Server configuration
export const SERVER_CONFIG = {
    // Remote multiplayer server 
    REMOTE_URL: 'wss://battleship-server-latest.onrender.com',
    
    // Local development server as this will still allow me to test multiplayer features
    LOCAL_URL: 'ws://localhost:3000',
    
    // Which server to use 
    USE_REMOTE: true  // Set to false for local testing
};

// Get active server URL
export const getServerUrl = () => {
    return SERVER_CONFIG.USE_REMOTE 
        ? SERVER_CONFIG.REMOTE_URL 
        : SERVER_CONFIG.LOCAL_URL;
};

// Storage keys for localStorage/sessionStorage to persist user session and game state
export const STORAGE_KEYS = {
    SESSION_TOKEN: 'sessionToken',
    USERNAME: 'username',
    MATCH_START_TIME: 'matchStartTime',
    MATCH_HISTORY: 'battleship_match_history',
    REMEMBER_ME: 'rememberMe',
    GAME_STATE: 'battleship_game_state' 
};

export const MESSAGE_TYPES = {
    //Auth and lobby messages
    REGISTER: 'register',
    LOGIN: 'login',
    LOGOUT: 'logout',
    AUTH_SUCCESS: 'auth_success',
    AUTH_ERROR: 'auth_error',
    KICKED: 'kicked',
    LOGOUT_SUCCESS: 'logout_success',
    ERROR: 'error',

    // Game messages
    PLAYER_LIST: 'player_list',
    INVITE_RECEIVED: 'invite_received',
    INVITE_ACCEPTED: 'invite_accepted',
    GAME_START: 'game_start',
    TURN_CHANGE: 'turn_change',
    SHOT_RESULT: 'shot_result',
    SHOT_FIRED: 'shot_fired',
    GAME_OVER: 'game_over'
};