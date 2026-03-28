const { cmd } = require('../command');
const { Settings } = require('../lib/mongodb'); 

// --- CONFIG COMMAND ---
cmd({
    pattern: "use",
    alias: ["set", "apply", "updateconfig"], // 'settings' ඉවත් කරන ලදී
    react: "🔌",
    desc: "Update bot configurations (Owner only)",
    category: "owner",
    use: ".config AUTO_STATUS_SEEN true",
    filename: __filename
},
async (test, mek, m, { args, reply }) => {
    try {
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber;

        if (!isBotOwner) {
            return reply("⚠️ *ACCESS DENIED* ⚠️");
        }

        const validSettings = ['AUTO_CALL_END', 'AUTO_MG_REACT', 'AUTO_STATUS_SEEN', 'AUTO_STATUS_REACT'];

        if (args.length < 2) {
            let list = "┌──『 *OSHIYA-MD SETTINGS* 』──◆\n";
            list += "┃\n";
            list += `┃ *Usage:* .config [setting_name] [true/false]\n`;
            list += "┃\n";
            list += "┠─『 *AVAILABLE OPTIONS* 』\n";
            validSettings.forEach(s => {
                list += `┃ ➥ ${s}\n`;
            });
            list += "┃\n";
            list += "└───────────────┈⊷";
            return reply(list);
        }

        const settingName = args[0].toUpperCase();
        const inputVal = args[1].toLowerCase();
        
        if (!validSettings.includes(settingName)) {
            return reply(`❌ *Invalid Setting:* ${settingName}\n\nකරුණාකර නිවැරදි නමක් ඇතුළත් කරන්න.`);
        }

        if (inputVal !== 'true' && inputVal !== 'false') {
            return reply("❌ කරුණාකර අගය *true* හෝ *false* ලෙස ඇතුළත් කරන්න.");
        }

        const value = (inputVal === 'true');

        // Database Update
        await Settings.findOneAndUpdate(
            { id: 'main_settings' }, 
            { [settingName]: value }, 
            { upsert: true, new: true }
        );

        return reply(`✅ *CONFIG UPDATED*\n\n⚙️ *Setting:* ${settingName}\n✨ *New Status:* ${value ? '🟢 ON' : '🔴 OFF'}`);

    } catch (e) {
        console.error("Config Error:", e);
        return reply("❌ Database update error. Please check logs.");
    }
});

// --- GET CONFIG COMMAND ---
cmd({
    pattern: "getconfig",
    alias: ["settings", "allconfig", "status"], // 'settings' මෙහි පමණක් තබා ඇත
    react: "🧑‍💻",
    desc: "Show current premium configurations",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply }) => {
    try {
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber;

        if (!isBotOwner) {
            return reply("⚠️ *PREMIUM FEATURE* ⚠️\n\nමෙය බැලීමට ඔබට අවසර නැත.");
        }

        let data = await Settings.findOne({ id: 'main_settings' });
        
        // දත්ත නොමැති නම් default අගයන් ඇතුළත් කිරීම
        if (!data) {
            data = await Settings.create({ 
                id: 'main_settings',
                AUTO_CALL_END: false,
                AUTO_MG_REACT: false,
                AUTO_STATUS_SEEN: false,
                AUTO_STATUS_REACT: false 
            });
        }
        
        let msg = "✨ 『 *OSHIYA-MD PREMIUM STATUS* 』 ✨\n\n";
        msg += `🛡️ *Auto Call End:* ${data.AUTO_CALL_END ? '🟢 ON' : '🔴 OFF'}\n`;
        msg += `⚡ *Auto Msg React:* ${data.AUTO_MG_REACT ? '🟢 ON' : '🔴 OFF'}\n`;
        msg += `👁️ *Auto Status Seen:* ${data.AUTO_STATUS_SEEN ? '🟢 ON' : '🔴 OFF'}\n`;
        msg += `💖 *Auto Status React:* ${data.AUTO_STATUS_REACT ? '🟢 ON' : '🔴 OFF'}\n\n`;
        msg += `💡 *Tip:* Use \`.apply [name] [true/false]\` to change settings.`;
        
        return reply(msg);

    } catch (e) {
        console.error("GetConfig Error:", e);
        return reply("❌ Data retrieval error.");
    }
});
