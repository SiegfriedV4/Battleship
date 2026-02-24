// ============================================
// Navigation UI that handles nav bar interactions
// ============================================

import { logout, getCurrentUsername } from '../auth/authManager.js';

/**
 * Initialize navigation UI
 * 
 * WHY: Set up logout button and display username
 * WHEN: User logs in and game loads
 */
export function initNavigation() {
    // Display current username in nav
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        const username = getCurrentUsername();
        if (username) {
            usernameDisplay.textContent = `👤 ${username}`;
            usernameDisplay.style.color = '#00d4ff';
            usernameDisplay.style.fontWeight = 'bold';
        }
    }
    
    // Bind logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Confirm logout
            // WHY: Prevent accidental logouts
            if (confirm('Are you sure you want to logout?')) {
                logout();
                
                // Reload page to show login screen
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        });
    }
}

/**
 * Hide navigation (for login screen)
 * 
 * WHY: Don't show game nav when not logged in
 */
export function hideNavigation() {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.style.display = 'none';
    }
}

/**
 * Show navigation (for game screen)
 * 
 * WHY: Show nav once user is logged in
 */
export function showNavigation() {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.style.display = 'flex';
    }
}