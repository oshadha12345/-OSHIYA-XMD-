const { cmd } = require('../command');
const { sendButtons } = require('gifted-btns');
const os = require('os');

function formatUptime(ms) {
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    hours %= 24;
    minutes %= 60;
    seconds %= 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

const prefix = "."; // oyage bot prefix eka

cmd({
    pattern: "alive",
    react: "💐",
    desc: "Check bot status",
    category: "main",
    fromMe: true, // owner only
    async handler({ sock, jid }) {

        const botName = "OSHIYA-MD";
        const ownerName = "OSHADHA";
        const platform = os.platform(); // Node.js platform
        const uptime = formatUptime(process.uptime() * 1000);
        const status = "Active ✅";

        const text = `*🤖 BOT INFO*
• Bot Name: ${botName}
• Owner: ${ownerName}
• Platform: ${platform}
• Uptime: ${uptime}
• Status: ${status}`;

        await sendButtons(sock, jid, {
            title: `${botName} is Online`,
            text: text,
            footer: 'Powered by OSHIYA-MD',
            image: { url: 'https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg' },
            buttons: [
                { id: `${prefix}menu`, text: 'Menu⚠' },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Open GitHub',
                        url: 'https://github.com/oshadha12345'
                    })
                }
            ]
        });
    }
});