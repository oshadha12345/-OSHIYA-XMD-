const { cmd, commands } = require('../command');
const config = require('../config');
const { sendButtons } = require('gifted-btns');

cmd({
    pattern: "alive",
    react: "⚠",
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
        // Send image first
        await danuwamd.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: config.ALIVE_MSG
        }, { quoted: mek });

        // Then send buttons using gifted-btns
        const buttons = [
            {
                id: `.menu`, // click කරන්නෙ menu command එක
                text: '📜 Open Menu'
            }
        ];

        await sendButtons(danuwamd, from, {
            title: '🤖 Bot Status',
            text: 'Click below to open the menu!',
            footer: config.BOT_NAME,
            buttons: buttons
        });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});