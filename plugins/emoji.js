const { cmd, commands } = require('../command');
const config = require('../config');

commands.push({
    on: "body",
    async function (conn, mek, m, { from, body, isGroup, isAdmins, isBotAdmins, reply }) {
        try {
            // Config එකේ AUTO_MESSAGE_REACT 'true' නම් පමණක් ක්‍රියාත්මක වේ
            if (config.AUTO_MESSAGE_REACT === 'true' || config.AUTO_MESSAGE_REACT === true) {
                
                // Emoji list එක config එකෙන් ගන්නවා, නැතිනම් default එකක් දෙනවා
                const emojiString = config.REACT_MESSAGE_EMOJIS || '❤️,😂,🔥,✨,💯,👍,✅';
                const emojis = emojiString.split(',');
                
                // අහඹු ලෙස emoji එකක් තෝරා ගැනීම
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
            console.log("Auto React Error: ", e);
        }
    }
});
