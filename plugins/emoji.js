const { cmd, commands } = require('../command');
const config = require('../config');

// ඕනෑම මැසේජ් එකක් ලැබුණු විට ක්‍රියාත්මක වන කොටස
commands.push({
    on: "body",
    async (conn, mek, m, { from, body, isGroup, isAdmins, isBotAdmins, reply }) => {
        try {
            // config එකේ AUTO_MESSAGE_REACT 'true' නම් පමණක් ක්‍රියාත්මක වේ
            if (config.AUTO_MESSAGE_REACT === 'true' || config.AUTO_MESSAGE_REACT === true) {
                
                // Emoji string එක array එකකට වෙන් කර ගැනීම
                const emojis = config.REACT_MESSAGE_EMOJIS.split(',');
                
                // ලැයිස්තුවෙන් අහඹු ලෙස emoji එකක් තෝරා ගැනීම
                const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)].trim();

                // අදාළ පණිවිඩයට React කිරීම
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
