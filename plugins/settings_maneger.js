const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../settings.json');

// Settings කියවීමේ ශ්‍රිතය
function getSettings() {
    if (!fs.existsSync(settingsPath)) {
        const defaultSettings = {
            AUTO_CALL_END: false,
            AUTO_MG_REACT: false,
            AUTO_STATUS_SEEN: false,
            AUTO_STATUS_REACT: false
        };
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
        return defaultSettings;
    }
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
}

cmd({
    pattern: "config",
    alias: ["settings", "sett"],
    desc: "බොට්ගේ settings වෙනස් කිරීමට (true/false)",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, isOwner }) => {
    if (!isOwner) return reply("❌ මෙම විධානය භාවිත කළ හැක්කේ Owner ට පමණි.");
    if (!q) return reply(`*භාවිතය:* .config [setting_name] [true/false]\n\n*උදාහරණ:* .config auto_call_end true\n\n*ලැයිස්තුව:* auto_call_end, auto_mg_react, auto_status_seen, auto_status_react`);

    const input = q.split(" ");
    const settingName = input[0].toUpperCase();
    const value = input[1] ? input[1].toLowerCase() : "";

    if (value !== "true" && value !== "false") return reply("❌ කරුණාකර අගය true හෝ false ලෙස ලබා දෙන්න.");

    let settings = getSettings();
    if (settings.hasOwnProperty(settingName)) {
        settings[settingName] = (value === "true");
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        return reply(`✅ *${settingName}* සාර්ථකව *${value}* කරන ලදී.`);
    } else {
        return reply("❌ එවැනි setting එකක් සොයාගත නොහැක.");
    }
});
