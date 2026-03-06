const { cmd } = require('../command');

cmd({
    pattern: "owner",
    react: "👑",
    alias: ["oshiya"],
    desc: "Get owner number",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from }) => {
    try {

        const ownerNumber = '+94756599952';
        const ownerName = '𝐎𝐬𝐡𝐢𝐲𝐚🔥';
        const organization = 'Oshiya Botz';

        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName}\n` +
                      `ORG:${organization};\n` +
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}\n` +
                      'END:VCARD';

        // Send only the vCard
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { 
            text: 'Sorry, there was an error fetching the owner contact.' 
        }, { quoted: mek });
    }
});
