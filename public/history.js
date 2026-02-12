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
   ADD MATCH
========================================== */

function addMatch() {

    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    const winner = document.getElementById("winner").value;
    const duration = document.getElementById("duration").value;
    const shots = document.getElementById("shots").value;

    if (!player1 || !player2 || !winner) {
        alert("Please fill in all required fields");
        return;
    }

    const newMatch = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        players: [player1, player2],
        winner: winner,
        durationSeconds: Number(duration),
        totalShots: Number(shots)
    };

    const matches = loadMatches();
    matches.push(newMatch);
    saveMatches(matches);

    renderMatches();
    clearInputs();
}

/* ==========================================
   RENDER TABLE
========================================== */

function renderMatches() {

    const matches = loadMatches();
    const tableBody = document.getElementById("history-body");

    tableBody.innerHTML = "";

    matches.forEach(match => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${new Date(match.date).toLocaleString()}</td>
            <td>${match.players[0]}</td>
            <td>${match.players[1]}</td>
            <td>${match.winner}</td>
            <td>${match.durationSeconds}s</td>
            <td>${match.totalShots}</td>
        `;

        tableBody.appendChild(row);
    });
}

/* ==========================================
   CLEAR FORM
========================================== */

function clearInputs() {
    document.querySelectorAll(".add-game input")
        .forEach(input => input.value = "");
}

/* ==========================================
   INIT
========================================== */

document.addEventListener("DOMContentLoaded", renderMatches);