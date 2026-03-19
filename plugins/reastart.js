const { cmd } = require("../command");
const config = require("../config");

cmd({
    pattern: "restart",
    alias: ["reboot"],
    react: "♻️",
    desc: "Restart bot",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, sender }) => {
    try {
        const owner = config.OWNER_NUMBER + "@s.whatsapp.net";

        if (sender !== owner) {
            return reply("❌ Only owner can use this command!");
        }

        await reply("♻️ Restarting bot...");

        console.log("🔄 Restarting FULL BOT...");

        // FULL restart trigger
        setTimeout(() => {
            process.exit(1);
        }, 1500);

    } catch (e) {
        console.log("Restart Error:", e);
        reply("❌ Restart failed!");
    }
});
