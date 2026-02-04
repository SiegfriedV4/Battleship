// Load matches from localStorage
function loadMatches() {
    const data = localStorage.getItem('battleship_matches');
    return data ? JSON.parse(data) : [];
}

// Save match to localStorage
function saveMatch(match) {
    const matches = loadMatches();
    matches.unshift(match);
    
    // Keep only 20 matches
    if (matches.length > 20) {
        matches.pop();
    }
    
    localStorage.setItem('battleship_matches', JSON.stringify(matches));
}

// Display matches
function displayMatches() {
    const matchList = document.getElementById('match-list');
    const noMatches = document.querySelector('.no-matches');
    const matches = loadMatches();
    
    if (matches.length === 0) {
        matchList.style.display = 'none';
        noMatches.style.display = 'block';
    } else {
        matchList.style.display = 'flex';
        noMatches.style.display = 'none';
        
        // Clear existing matches and render saved ones
        matchList.innerHTML = '';
        
        matches.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            
            const matchDate = new Date(match.date);
            const dateString = matchDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            const timeString = matchDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            
            matchCard.innerHTML = `
                <div class="match-header">
                    <span class="match-result ${match.result}">${match.result === 'win' ? 'VICTORY' : 'DEFEAT'}</span>
                    <span class="match-date">${dateString} - ${timeString}</span>
                </div>
                <div class="match-stats">
                    <div class="stat">
                        <span class="stat-label">Shots</span>
                        <span class="stat-value">${match.shots}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Hits</span>
                        <span class="stat-value">${match.hits}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Accuracy</span>
                        <span class="stat-value">${match.accuracy}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Duration</span>
                        <span class="stat-value">${match.duration}</span>
                    </div>
                </div>
                <div class="match-details">
                    Enemy Ships Sunk: ${match.shipsSunk}
                </div>
            `;
            
            matchList.appendChild(matchCard);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', displayMatches);