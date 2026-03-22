const { cmd, commands } = require('../command');
const config = require('../config');

// Hama message ekakatama emoji react karana plugin eka
commands.push({
    on: "body",
    async (conn, mek, m, { from, body, isGroup, isAdmins, isBotAdmins, reply }) => {
        try {
            // Config eke AUTO_MESSAGE_REACT 'true' nam pamanak kriyaathmaka we
            if (config.AUTO_MESSAGE_REACT === 'true' || config.AUTO_MESSAGE_REACT === true) {
                
                // Emoji list eka config eken gannawa
                // Ewa neththam default emoji tikak use karanawa
                const emojiString = config.REACT_MESSAGE_EMOJIS || '❤️,😂,🔥,✨,💯,👍,✅,🤖,🌟,⚡';
                const emojis = emojiString.split(',');
                
                // List eken random emoji ekak thoragannawa
                const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)].trim();

                // Message ekata React kireema
                await conn.sendMessage(from, {
                    react: {
                        text: selectedEmoji,
                        key: mek.key
                    }
                });
            }
        } catch (e) {
            console.log("Auto React Error: ", e);
        }
    }
});
