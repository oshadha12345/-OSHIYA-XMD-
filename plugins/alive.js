const { cmd, commands } = require('../command');
const config = require('../config');

let aliveMsgId = null; // message id store කරන්න

cmd({
    pattern: "alive",
    react: "💗",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (danuwamd, mek, m, {
    from, reply
}) => {
    try {

        const caption = `
${config.ALIVE_MSG}

Reply with:

1 - Menu
2 - Ping
        `;

        const sent = await danuwamd.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: caption
        }, { quoted: mek });

        // save message id
        aliveMsgId = sent.key.id;

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});


// 🔹 Reply Detect Part
cmd({
    on: "text"
},
async (danuwamd, mek, m, {
    from, body
}) => {

    if (!mek.quoted) return;
    if (mek.quoted.id !== aliveMsgId) return;

    if (body === "1") {
        // MENU run
        const menuCmd = commands.find(c => c.pattern === "menu");
        if (menuCmd) {
            menuCmd.function(danuwamd, mek, m, { from });
        }
    }

    if (body === "2") {
        // PING run
        const pingCmd = commands.find(c => c.pattern === "ping");
        if (pingCmd) {
            pingCmd.function(danuwamd, mek, m, { from });
        }
    }

});