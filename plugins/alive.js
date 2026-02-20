const { cmd } = require('../command');
const .env = require('./.env');

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
        const aliveImage = process.env.ALIVE_IMAGE; // .env eken ganna
        const aliveMsg = process.env.ALIVE_MSG;     // .env eken ganna

        return await danuwamd.sendMessage(from, {
            image: { url: aliveImage },
            caption: aliveMsg
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});