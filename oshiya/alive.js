const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "alive",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {

        await conn.sendMessage(from, {
            text: config.ALIVE_MSG || "*🤖 I'm Alive Now!*",
            footer: "Select an option below",
            title: "Bot Status",
            buttonText: "Click Here",
            sections: [
                {
                    title: "Main Options",
                    rows: [
                        {
                            title: "Ping",
                            description: "Check bot speed",
                            rowId: ".ping"
                        },
                        {
                            title: "Menu",
                            description: "Open bot menu",
                            rowId: ".menu"
                        }
                    ]
                }
            ]
        }, { quoted: mek });

    } catch (e) {
        console.log("Alive Command Error:", e);
        reply(`Error: ${e.message}`);
    }
});