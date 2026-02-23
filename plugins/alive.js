const { cmd, commands } = require('../command');
const config = require('../config');

cmd({
    pattern: "alive",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (danuwamd, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup,
    sender, senderNumber, botNumber2, botNumber, pushname,
    isMe, isOwner, groupMetadata, groupName, participants,
    groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {

        // If user replies 1
        if (q === "1") {
            const menu = require('./menu');
            return menu(danuwamd, mek, m, { from, reply });
        }

        // If user replies 2
        if (q === "2") {
            const ping = require('./ping');
            return ping(danuwamd, mek, m, { from, reply });
        }

        // Default alive message
        return await danuwamd.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: `${config.ALIVE_MSG}

Reply with:

1️⃣  Menu
2️⃣  Ping`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});