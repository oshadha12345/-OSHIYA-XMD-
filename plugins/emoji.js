const { cmd, commands } = require('../command');
const config = require('../config');

commands.push({
    on: "body",
    async function (conn, mek, m, { from, body, isGroup, isAdmins, isBotAdmins, reply }) {
        try {
            // Config එකේ සක්‍රීයද සහ Emojis තියෙනවද කියලා බලනවා
            if (config.AUTO_MESSAGE_REACT === 'true' || config.AUTO_MESSAGE_REACT === true) {
                
                // Emoji list එකක් නැතිනම් reaction එකක් වෙන්නේ නැහැ
                if (!config.REACT_MESSAGE_EMOJIS) return;

                const emojis = config.REACT_MESSAGE_EMOJIS.split(',');
                const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)].trim();

                await conn.sendMessage(from, {
                    react: {
                        text: selectedEmoji,
                        key: mek.key
                    }
                });
            }
        } catch (e) {
            console.log("Error in Auto React: ", e);
        }
    }
});
