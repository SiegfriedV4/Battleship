// ============================================
// Password validator that validates password strength and requirements
// ============================================

export const PASSWORD_REQUIREMENTS = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SYMBOL: true
};

/**
 * Validate password against all requirements
 * @param {string} password - Password to validate
 * @returns {object} Result with isValid and errors array
 */
export function validatePassword(password) {
    const errors = [];
    
    // Check minimum length
    if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
        errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`);
    }
    
    // Check for uppercase letter
    if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    // Check for lowercase letter
    if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    // Check for number
    if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    // Check for special character
    if (PASSWORD_REQUIREMENTS.REQUIRE_SYMBOL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        strength: calculateStrength(password)
    };
}

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to analyze
 * @returns {object} Strength score and level
 * WHY: Provide real-time feedback on password strength as user types
 */
function calculateStrength(password) {
    let score = 0;
    
    // Length bonus (up to 30 points)
    score += Math.min(password.length * 3, 30);
    
    // Character variety bonuses
    if (/[a-z]/.test(password)) score += 10;  // Lowercase
    if (/[A-Z]/.test(password)) score += 15;  // Uppercase
    if (/\d/.test(password)) score += 15;     // Numbers
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;  // Symbols
    
    // Additional complexity bonuses
    if (password.length >= 12) score += 10;   // Long password
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) score += 10;  // All types
    
    // Determine strength level
    let level = 'weak';
    if (score >= 80) level = 'strong';
    else if (score >= 60) level = 'medium';
    
    return {
        score: Math.min(score, 100),
        level: level,
        color: level === 'strong' ? '#27ae60' : level === 'medium' ? '#f39c12' : '#e74c3c'
    };
}

/**
 * Get password requirements as a formatted list
 * @returns {string[]} Array of requirement descriptions
 * 
 * WHY: Display requirements to user before they type
 */
export function getRequirementsList() {
    const requirements = [];
    
    requirements.push(`At least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`);
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE) {
        requirements.push('At least one uppercase letter (A-Z)');
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE) {
        requirements.push('At least one lowercase letter (a-z)');
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER) {
        requirements.push('At least one number (0-9)');
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_SYMBOL) {
        requirements.push('At least one special character (!@#$%^&*)');
    }
    
    return requirements;
}