// ============================================
// Websocket chanages connection to game server with token authentication
// ============================================

import { getServerUrl } from './config.js';
import { STORAGE_KEYS } from './config.js';

let socket = null;

/**
 * Initialize WebSocket connection
 * @param {Function} onMessageCallback - Handle messages from server
 * 
 * WHY: Connect to remote server for multiplayer
 * WHEN: App loads
 */
export function initSocket(onMessageCallback) {
    const serverUrl = getServerUrl();
    
    console.log(`🔌 Connecting to server: ${serverUrl}`);
    
    socket = new WebSocket(serverUrl);

    socket.addEventListener('open', () => {
        console.log('✅ Connected to server');
    });

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('📩 Server says:', data);
        onMessageCallback(data);
    });

    socket.addEventListener('close', () => {
        console.log('❌ Disconnected from server');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            initSocket(onMessageCallback);
        }, 3000);
    });

    socket.addEventListener('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });
}

/**
 * Send data to server
 * @param {object} data - Data to send
 * 
 * WHY: Send game actions to server
 * WHEN: User performs any action (shoot, place ships, etc.)
 * 
 * CRITICAL: Automatically adds sessionToken to authenticate
 */
export function sendToServer(data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error('❌ WebSocket not connected');
        return;
    }

    // ⭐ CRITICAL FIX: Add session token to every request
    // WHY: Server needs token to verify you're authenticated
    const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    
    // Don't add token to login/register requests (they don't have one yet)
    const skipTokenFor = ['login', 'register'];
    
    if (sessionToken && !skipTokenFor.includes(data.type)) {
        data.sessionToken = sessionToken;
    }

    console.log('📤 Sending to server:', data);
    socket.send(JSON.stringify(data));
}

/**
 * Check if connected to server
 * @returns {boolean} True if connected
 */
export function isConnected() {
    return socket && socket.readyState === WebSocket.OPEN;
}

/**
 * Close WebSocket connection
 */
export function closeSocket() {
    if (socket) {
        socket.close();
        socket = null;
    }
}