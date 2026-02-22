const gis = require('g-i-s');
const { cmd } = require("../command");
const { sendInteractiveMessage } = require('gifted-btns');

cmd({
    pattern: "jid",
    alias: ["myid", "userjid"],
    react: "🆔",
    desc: "Get user's JID or replied user's JID.",
    category: "main",
    filename: __filename,
}, 
async (sock, mek, m, { from, reply, isGroup, sender }) => {

    try {

        let targetJid = m.quoted ? m.quoted.sender : sender;
        let username = targetJid.split('@')[0];

        let premiumText = `
╔══════════════════╗
        🆔  USER JID INFO
╚══════════════════╝

👤  User : @${username}

📋  Tap the button below to copy JID
        `;

        await sendInteractiveMessage(sock, from, {
            text: premiumText.trim(),
            mentions: [targetJid],
            interactiveButtons: [
                {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                        display_text: "📋 Copy JID",
                        copy_code: targetJid
                    })
                }
            ]
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Unable to fetch JID information.");
    }
});