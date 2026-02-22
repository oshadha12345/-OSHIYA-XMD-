const { cmd, commands } = require('../command');
const config = require('../config');

cmd({
    pattern: "alive",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (danuwamd, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    reply
}) => {

    try {

        // =============================
        // Reply 1 or 2 Handling
        // =============================
        if (!isCmd && m.quoted && m.quoted.text &&
            m.quoted.text.includes("PREMIUM BOT STATUS")) {

            // Reply 1 → Run .menu
            if (body === "1") {

                let menuCmd = commands.find(c => c.pattern === "menu");

                if (menuCmd) {
                    return await menuCmd.function(danuwamd, mek, m, {
                        from,
                        quoted: mek,
                        body: ".menu",
                        isCmd: true,
                        command: "menu",
                        args: [],
                        q: "",
                        reply
                    });
                }
            }

            // Reply 2 → Run .ping
            if (body === "2") {

                let pingCmd = commands.find(c => c.pattern === "ping");

                if (pingCmd) {
                    return await pingCmd.function(danuwamd, mek, m, {
                        from,
                        quoted: mek,
                        body: ".ping",
                        isCmd: true,
                        command: "ping",
                        args: [],
                        q: "",
                        reply
                    });
                }
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
        reply(`${e}`);
    }
});