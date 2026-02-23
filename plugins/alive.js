const { cmd, commands } = require('../command');
const config = require('../config');

cmd({
    pattern: "alive",
    react: "💗",
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

        if (q === "1") {
            return reply(".menu");
        }

        if (q === "2") {
            return reply(".ping🔥");
        }

        return await danuwamd.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: config.ALIVE_MSG + "\n\nReply with:\n1\n2"
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});