let socket = null;

/* =========================
   INITIALISE SOCKET
========================= */

export function initSocket(onMessageCallback) {
    socket = new WebSocket("ws://localhost:3000");

    socket.addEventListener("open", () => {
        console.log("✅ Connected to server");

        registerTestUser();
    });

    socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        console.log("📩 Server says:", data);
        onMessageCallback(data);
    });

    socket.addEventListener("close", () => {
        console.log("❌ Disconnected from server");
    });
}

/* =========================
   SEND TO SERVER
========================= */

export function sendToServer(data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error("❌ WebSocket not connected");
        return;
    }

    console.log("📤 Sending to server:", data);
    socket.send(JSON.stringify(data));
}

/* =========================
   AUTO REGISTER (TEMP)
========================= */

function registerTestUser() {
    const randomUser = "player" + Math.floor(Math.random() * 1000);

    sendToServer({
        type: "register",
        username: randomUser,
        password: "password123"
    });
}
