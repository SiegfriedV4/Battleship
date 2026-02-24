// ============================================
// AUTHENTICATION MANAGER
// Handles login, register, and session management
// ============================================

import { STORAGE_KEYS, MESSAGE_TYPES } from '../config.js';
import { sendToServer } from '../websocket.js';
import { validatePassword } from './passwordValidator.js';
import { showError, showSuccess } from '../ui/notificationManager.js';

/**
 * Register a new user
 * @param {string} username - Username to register
 * @param {string} password - Password
 * @returns {Promise} Resolves when registration succeeds
 * 
 * WHY: Creates new account on the server
 * WHEN: User clicks "Register" button
 */
export async function register(username, password) {
    // Validate inputs client-side first
    // WHY: Give instant feedback before sending to server
    if (!username || username.trim().length < 3) {
        showError('Username must be at least 3 characters long');
        return Promise.reject('Invalid username');
    }
    
    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
        showError(validation.errors[0]);  // Show first error
        return Promise.reject('Weak password');
    }
    
    // Send registration request to server
    // WHY: Server validates and creates account in database
    sendToServer({
        type: MESSAGE_TYPES.REGISTER,
        username: username.trim(),
        password: password
    });
    
    // Return promise that resolves on auth_success
    // WHY: Allows calling code to wait for server response
    return new Promise((resolve, reject) => {
        // This will be resolved by messageHandler when auth_success arrives
        window._authPromise = { resolve, reject };
    });
}

/**
 * Login existing user
 * @param {string} username - Username
 * @param {string} password - Password
 * @param {boolean} rememberMe - Save session for auto-login
 * @returns {Promise} Resolves when login succeeds
 * 
 * WHY: Authenticates existing user
 * WHEN: User clicks "Login" button
 */
export async function login(username, password, rememberMe = false) {
    // Basic validation
    if (!username || !password) {
        showError('Please enter username and password');
        return Promise.reject('Missing credentials');
    }
    
    // Send login request
    // WHY: Server verifies credentials against database
    sendToServer({
        type: MESSAGE_TYPES.LOGIN,
        username: username.trim(),
        password: password
    });
    
    // Save remember me preference
    // WHY: Auto-login on next visit if user wants it
    if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    }
    
    return new Promise((resolve, reject) => {
        window._authPromise = { resolve, reject };
    });
}

/**
 * Logout current user
 * 
 * WHY: Clear session and disconnect from server
 * WHEN: User clicks "Logout" button
 */
export function logout() {
    // Tell server we're logging out
    // WHY: Server removes us from active players list
    sendToServer({
        type: MESSAGE_TYPES.LOGOUT
    });
    
    // Clear local session data
    // WHY: Remove stored credentials and tokens
    clearSession();
    
    showSuccess('Logged out successfully');
}

/**
 * Handle successful authentication from server
 * @param {object} message - Auth success message from server
 * 
 * WHY: Store session data and transition to game
 * WHEN: Server sends auth_success message
 */
export function handleAuthSuccess(message) {
    // Save session token
    // WHY: Token proves we're authenticated for future requests
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, message.sessionToken);
    
    // Save username
    // WHY: Display in UI and identify ourselves in game
    localStorage.setItem(STORAGE_KEYS.USERNAME, message.user.username);
    
    // Resolve the pending promise
    if (window._authPromise) {
        window._authPromise.resolve(message);
        window._authPromise = null;
    }
    
    showSuccess(`Welcome, ${message.user.username}!`);
}

/**
 * Handle authentication error from server
 * @param {object} message - Error message from server
 * 
 * WHY: Show user why authentication failed
 * WHEN: Server rejects login/register attempt
 */
export function handleAuthError(message) {
    showError(message.message || 'Authentication failed');
    
    // Reject the pending promise
    if (window._authPromise) {
        window._authPromise.reject(message.message);
        window._authPromise = null;
    }
}

/**
 * Handle being kicked from another session
 * @param {object} message - Kick message from server
 * 
 * WHY: User logged in from another device/browser
 * WHEN: Server detects duplicate login
 */
export function handleKicked(message) {
    clearSession();
    showError('You have been logged in from another device');
    
    // Reload page to show login screen
    // WHY: Force user to re-authenticate
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

/**
 * Clear local session data
 * 
 * WHY: Remove all authentication data from browser
 * WHEN: Logout or kicked
 */
function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
}

/**
 * Check if user is currently logged in
 * @returns {boolean} True if session token exists
 * 
 * WHY: Determine if we need to show login screen
 * WHEN: App loads
 */
export function isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
}

/**
 * Get current username
 * @returns {string|null} Username or null if not logged in
 * 
 * WHY: Display current user in UI
 */
export function getCurrentUsername() {
    return localStorage.getItem(STORAGE_KEYS.USERNAME);
}

/**
 * Check if user wants auto-login
 * @returns {boolean} True if remember me is enabled
 * 
 * WHY: Skip login screen if user chose "remember me"
 */
export function shouldRemember() {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
}