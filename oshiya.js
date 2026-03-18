const config = require("./config");

// 🟢 ONLINE / OFFLINE STATUS
async function handlePresence(sock) {
    try {
        setInterval(async () => {
            if (config.AUTO_ONLINE) {
                await sock.sendPresenceUpdate("available");
            } else {
                await sock.sendPresenceUpdate("unavailable");
            }
        }, 20000); // 20 sec

    } catch (err) {
        console.log("Presence Error:", err);
    }
}

// ✍️ AUTO TYPING
async function autoTyping(sock, jid) {
    try {
        if (!config.AUTO_TYPING) return;

        await sock.sendPresenceUpdate("composing", jid);

    } catch (err) {
        console.log("Typing Error:", err);
    }
}

// 🎙️ AUTO RECORDING
async function autoRecording(sock, jid) {
    try {
        if (!config.AUTO_RECORDING) return;

        await sock.sendPresenceUpdate("recording", jid);

    } catch (err) {
        console.log("Recording Error:", err);
    }
}

module.exports = {
    handlePresence,
    autoTyping,
    autoRecording
};
