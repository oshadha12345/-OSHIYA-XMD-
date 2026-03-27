const { cmd } = require('../command');
const { Settings } = require('../lib/mongodb'); 

// --- CONFIG COMMAND ---
cmd({
    pattern: "config",
    alias: ["settings", "set", "apply"],
    react: "🔌",
    desc: "Update bot configurations (Owner only)",
    category: "owner",
    use: ".config AUTO_STATUS_SEEN true",
    filename: __filename
},
async (test, mek, m, { args, reply, prefix, isOwner }) => {
    try {
        // අයිතිකරු පමණක් දැයි පරීක්ෂාව
        if (!isOwner) return reply("⚠️ *ACCESS DENIED* ⚠️\n\nමෙම විධානය භාවිතා කළ හැක්කේ Bot හිමිකරුට (Premium) පමණි.");

        if (args.length < 2) {
            let list = "┌──『 *OSHIYA-MD SETTINGS* 』──◆\n";
            list += "┃\n";
            list += `┃ *Usage:* ${prefix}config [Name] [true/false]\n`;
            list += "┃\n";
            list += "┠─『 *AVAILABLE* 』\n";
            list += "┃ ➥ AUTO_CALL_END\n";
            list += "┃ ➥ AUTO_MG_REACT\n";
            list += "┃ ➥ AUTO_STATUS_SEEN\n";
            list += "┃ ➥ AUTO_STATUS_REACT\n";
            list += "┃\n";
            list += "└───────────────┈⊷";
            return reply(list);
        }

        const settingName = args[0].toUpperCase();
        const inputVal = args[1].toLowerCase();
        const validSettings = ['AUTO_CALL_END', 'AUTO_MG_REACT', 'AUTO_STATUS_SEEN', 'AUTO_STATUS_REACT'];
        
        if (!validSettings.includes(settingName)) {
            return reply(`❌ *No Settings*`);
        }

        if (inputVal !== 'true' && inputVal !== 'false') {
            return reply("❌ *true / false*");
        }

        const value = inputVal === 'true';

        await Settings.findOneAndUpdate(
            { id: 'main_settings' }, 
            { [settingName]: value }, 
            { upsert: true, new: true }
        );

        return reply(`✅ *CONFIG UPDATED*\n\n⚙️ *Setting:* ${settingName}\n✅ *Status:* ${value ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}`);

    } catch (e) {
        console.error(e);
        return reply("❌ Database update error.");
    }
});

// --- GET CONFIG COMMAND ---
cmd({
    pattern: "getconfig",
    alias: ["settings", "allconfig"],
    react: "🧑‍💻",
    desc: "Show current premium configurations",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, prefix, isOwner }) => {
    try {
        if (!isOwner) return reply("⚠️ *PREMIUM FEATURE* ⚠️\n\nමෙය බැලීමට ඔබට අවසර නැත.");

        let data = await Settings.findOne({ id: 'main_settings' });
        
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
        msg += ".apply Command Change Settings 🖤";
        
        return reply(msg);

    } catch (e) {
        console.error(e);
        return reply("❌ Data retrieval error.");
    }
});
