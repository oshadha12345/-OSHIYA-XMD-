const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "set",
    desc: "Change bot settings (statusseen, statusreact, autoreact, autocall)",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sessionLabel }) => {
    if (args.length < 2) {
        return reply(`*⚙️ SETTINGS FOR [${sessionLabel}]*\n\n*Usage:* .set [option] [true/false]\n\n*Options:* statusseen, statusreact, autoreact, autocall`);
    }

    const option = args[0].toLowerCase();
    const value = args[1].toLowerCase() === 'true';
    const settingsPath = path.join(__dirname, '../bot_settings.json');

    let allSettings = {};
    if (fs.existsSync(settingsPath)) {
        allSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    if (!allSettings[sessionLabel]) allSettings[sessionLabel] = {};

    let configKey = "";
    switch(option) {
        case 'statusseen': configKey = 'AUTO_STATUS_SEEN'; break;
        case 'statusreact': configKey = 'AUTO_STATUS_REACT'; break;
        case 'autoreact': configKey = 'AUTO_MG_REACT'; break;
        case 'autocall': configKey = 'AUTO_CALL_END'; break;
        default: return reply("❌ Invalid Option!");
    }

    allSettings[sessionLabel][configKey] = value;
    fs.writeFileSync(settingsPath, JSON.stringify(allSettings, null, 2));

    reply(`✅ *UPDATE SUCCESSFUL*\n\n🤖 *Bot:* ${sessionLabel}\n⚙️ *Setting:* ${option}\n✨ *Status:* ${value ? 'ENABLED' : 'DISABLED'}`);
});
