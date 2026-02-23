const { cmd, commands } = require('../command');
const config = require('../config');
const { sendButtons } = require('gifted-btns');

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

        await sendButtons(danuwamd, from, {
            image: { url: config.ALIVE_IMG },
            text: config.ALIVE_MSG,
            footer: "Select an option below",
            buttons: [
                {
                    prifix: '.',
                    id: 'ping',
                    text: 'Ping'
                },
                {
                    prifix: '.',
                    id: 'menu',
                    text: 'Menu'
                }
            ]
        });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});