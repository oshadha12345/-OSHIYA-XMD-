const { cmd, commands } = require('../command');
const config = require('../config');

// 1. පාලක විධානය (Command to ON/OFF)
cmd({
    pattern: "autoreact",
    desc: "Auto message reaction සක්‍රීය හෝ අක්‍රීය කරයි.",
    category: "owner",
    use: '.autoreact on/off',
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, reply }) => {
    try {
        // Owner පරීක්ෂා කිරීම (Config එකේ ඇති OWNER_NUMBER සමඟ)
        const currentUser = m.sender.split('@')[0];
        const isOwner = config.OWNER_NUMBER.includes(currentUser);

        if (!isOwner) return reply("🚫 මෙම විධානය භාවිතා කළ හැක්කේ බොට්ගේ අයිතිකරුට (Owner) පමණි!");

        if (q === 'on') {
            config.AUTO_MESSAGE_REACT = 'true';
            return reply("✅ **Auto Message Reaction සක්‍රීය කරන ලදී!**\nදැන් ලැබෙන සියලුම පණිවිඩ වලට බොට් React කරනු ඇත.");
        } else if (q === 'off') {
            config.AUTO_MESSAGE_REACT = 'false';
            return reply("❌ **Auto Message Reaction අක්‍රීය කරන ලදී!**");
        } else {
            return reply("පාවිච්චි කරන ආකාරය: \n.autoreact on\n.autoreact off");
        }
    } catch (e) {
        console.log(e);
        reply("Error: " + e);
    }
});

// 2. ස්වයංක්‍රීයව React වන කොටස
commands.push({
    on: "body",
    async function (conn, mek, m, { from, body, isGroup }) {
        try {
            // Config එකේ AUTO_MESSAGE_REACT 'true' නම් පමණක් ක්‍රියාත්මක වේ
            if (config.AUTO_MESSAGE_REACT === 'true' || config.AUTO_MESSAGE_REACT === true) {
                
                // ඔබ ලබා දුන් Emoji ලැයිස්තුව (config එකෙන් හෝ default එකක්)
                const emojiString = config.REACT_MESSAGE_EMOJIS || '❤️,😂,🔥,✨,💯,👍,✅';
                const emojis = emojiString.split(',');
                
                // අහඹු ලෙස emoji එකක් තෝරා ගැනීම
                const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)].trim();

                // පණිවිඩයට React කිරීම
                await conn.sendMessage(from, {
                    react: {
                        text: selectedEmoji,
                        key: mek.key
                    }
                });
            }
        } catch (e) {
            // Error log එකක් පමණක් පෙන්වයි (Chat එකට එවන්නේ නැත)
            console.log("Auto React Error: ", e);
        }
    }
});
