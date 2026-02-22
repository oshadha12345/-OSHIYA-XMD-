const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "alive",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (danuwamd, mek, m, {
    from, body, isCmd
}) => {

    try {

        // =============================
        // Reply Handling (NO SUBMENU)
        // =============================
        if (
            !isCmd &&
            m.quoted &&
            m.quoted.text &&
            m.quoted.text.includes("PREMIUM BOT STATUS")
        ) {

            const input = body.trim();

            // Reply 1 → Send .menu message
            if (input === "1") {
                return await danuwamd.sendMessage(from, {
                    text: ".menu"
                });
            }

            // Reply 2 → Send .ping message
            if (input === "2") {
                return await danuwamd.sendMessage(from, {
                    text: ".ping"
                });
            }
        }

        // =============================
        // Default Alive Message
        // =============================
        return await danuwamd.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: `
╭━━━〔 💎 PREMIUM BOT STATUS 〕━━━╮
┃ 🤖 *Bot:* ${config.BOT_NAME}
┃ 👑 *Owner:* ${config.OWNER_NAME}
┃ ⚡ *Mode:* Public
┃ 🔥 *Version:* 3.0 Premium
╰━━━━━━━━━━━━━━━━━━━━╯

📌 *Reply this message with number:*

     1️⃣  ➜  MENU  
     2️⃣  ➜  PING  

🟢 Bot is fully online & ready!
`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
    }
});