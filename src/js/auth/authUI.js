// ============================================
// Authentication UI login and registration forms
// ============================================

import { register, login } from './authManager.js';
import { validatePassword, getRequirementsList } from './passwordValidator.js';
import { showError } from '../ui/notificationManager.js';
import { hideNavigation, showNavigation } from '../ui/navigationUI.js';

/**
 * Show login screen
 */
export function showLoginScreen() {
    hideNavigation();
    
    const container = document.getElementById('auth-container');
    if (!container) {
        console.error('Auth container not found in HTML');
        return;
    }
    
    container.innerHTML = `
        <div class="auth-card">
            <h1>⚓ Battleship</h1>
            <p class="auth-subtitle">Login to play multiplayer</p>
            
            <form id="login-form">
                <input 
                    type="text" 
                    id="login-username" 
                    placeholder="Username" 
                    autocomplete="username"
                    required
                />
                
                <input 
                    type="password" 
                    id="login-password" 
                    placeholder="Password" 
                    autocomplete="current-password"
                    required
                />
                
                <label class="remember-me">
                    <input type="checkbox" id="remember-me" />
                    <span>Remember me</span>
                </label>
                
                <button type="submit" class="btn-primary">Login</button>
            </form>
            
            <p class="auth-switch">
                Don't have an account? 
                <a href="#" id="show-register">Register</a>
            </p>
        </div>
    `;
    
    container.style.display = 'flex';
    bindLoginEvents();
}

/**
 * Show registration screen
 */
export function showRegisterScreen() {
    const container = document.getElementById('auth-container');
    const requirements = getRequirementsList();
    
    container.innerHTML = `
        <div class="auth-card">
            <h1>⚓ Battleship</h1>
            <p class="auth-subtitle">Create your account</p>
            
            <form id="register-form">
                <input 
                    type="text" 
                    id="register-username" 
                    placeholder="Username (min 3 characters)" 
                    autocomplete="username"
                    required
                />
                
                <div class="password-field">
                    <input 
                        type="password" 
                        id="register-password" 
                        placeholder="Password" 
                        autocomplete="new-password"
                        required
                    />
                    <div id="password-strength" class="password-strength"></div>
                </div>
                
                <div class="password-requirements">
                    <p><strong>Password must have:</strong></p>
                    <ul>
                        ${requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                
                <button type="submit" class="btn-primary">Register</button>
            </form>
            
            <p class="auth-switch">
                Already have an account? 
                <a href="#" id="show-login">Login</a>
            </p>
        </div>
    `;
    
    bindRegisterEvents();
}

/**
 * Hide auth screen and show lobby
 * WHY: After login, user needs to see online players
 */
export function hideAuthScreen() {
    const container = document.getElementById('auth-container');
    if (container) {
        container.style.display = 'none';
    }
    
    // ⭐ Show lobby (NOT game screen)
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) {
        lobbyScreen.style.display = 'block';
    }
    
    showNavigation();
}

/**
 * Show game screen (called when game starts)
 * WHY: After accepting invite, hide lobby and show game
 */
export function showGameScreen() {
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) {
        lobbyScreen.style.display = 'none';
    }
    
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.style.display = 'block';
    }
}

/**
 * Bind events for login form
 */
function bindLoginEvents() {
    const form = document.getElementById('login-form');
    const showRegister = document.getElementById('show-register');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        try {
            await login(username, password, rememberMe);
            hideAuthScreen();
            window.dispatchEvent(new CustomEvent('auth-success'));
        } catch (error) {
            console.error('Login failed:', error);
        }
    });
    
    showRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterScreen();
    });
}

/**
 * Bind events for register form
 */
function bindRegisterEvents() {
    const form = document.getElementById('register-form');
    const passwordInput = document.getElementById('register-password');
    const showLogin = document.getElementById('show-login');
    
    passwordInput?.addEventListener('input', (e) => {
        const password = e.target.value;
        const validation = validatePassword(password);
        const strengthBar = document.getElementById('password-strength');
        
        if (password.length > 0) {
            strengthBar.style.display = 'block';
            strengthBar.style.width = validation.strength.score + '%';
            strengthBar.style.backgroundColor = validation.strength.color;
            strengthBar.textContent = validation.strength.level.toUpperCase();
        } else {
            strengthBar.style.display = 'none';
        }
    });
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        
        try {
            await register(username, password);
            hideAuthScreen();
            window.dispatchEvent(new CustomEvent('auth-success'));
        } catch (error) {
            console.error('Registration failed:', error);
        }
    });
    
    showLogin?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginScreen();
    });
}