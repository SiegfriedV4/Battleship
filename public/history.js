const STORAGE_KEY = "battleship_match_history";

/* ==========================================
   LOAD MATCHES
========================================== */
function loadMatches() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

/* ==========================================
   SAVE MATCHES
========================================== */
function saveMatches(matches) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

/* ==========================================
   RENDER TABLE
========================================== */
function renderMatches() {
    const matches = loadMatches();
    const tableBody = document.getElementById("history-body");
    const currentUser = localStorage.getItem("username");

    tableBody.innerHTML = "";

    matches
        .slice()
        .reverse()
        .forEach(match => {

            const isWin = match.winner === currentUser;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${new Date(match.date).toLocaleString()}</td>
                <td>${currentUser}</td>
                <td>${match.opponent}</td>
                <td class="${isWin ? "win" : "loss"}">
                    ${isWin ? "WIN" : "LOSS"}
                </td>
                <td>${match.durationSeconds}s</td>
                <td>${match.totalShots}</td>
            `;

            tableBody.appendChild(row);
        });
}

/* ==========================================
   CLEAR HISTORY
========================================== */
function clearHistory() {
    if (!confirm("Clear all match history?")) return;

    localStorage.removeItem(STORAGE_KEY);
    renderMatches();
}

/* ==========================================
   INIT
========================================== */
document.addEventListener("DOMContentLoaded", () => {
    renderMatches();
    document.getElementById("clear-history")
        .addEventListener("click", clearHistory);
});
