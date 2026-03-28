const { cmd } = require('../command');
const { Settings } = require('../lib/mongodb'); 

// --- CONFIG COMMAND ---
cmd({
    pattern: "use",
    alias: ["set", "apply", "updateconfig"],
    react: "🔌",
    desc: "Update bot configurations (Owner only)",
    category: "owner",
    use: ".use WORK_TYPE private",
    filename: __filename
},
async (test, mek, m, { args, reply, isOwner }) => {
    try {
        // isOwner පරීක්ෂාව සරලව සිදු කිරීම (command hander එකෙන් ලැබෙන isOwner භාවිතා කළ හැක)
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber || isOwner;

        if (!isBotOwner) {
            return reply("⚠️ *ACCESS DENIED* ⚠️");
        }

        // වලංගු සෙටින්ග්ස් ලැයිස්තුව
        const validSettings = [
            'AUTO_CALL_END', 
            'AUTO_MG_REACT', 
            'AUTO_STATUS_SEEN', 
            'AUTO_STATUS_REACT',
            'WORK_TYPE', 
            'PREFIX'
        ];

        if (args.length < 2) {
            let list = "┌──『 *OSHIYA-MD SETTINGS* 』──◆\n";
            list += "┃\n";
            list += `┃ *Usage:* .use [setting_name] [value]\n`;
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
        let inputVal = args[1]; // Prefix වැනි දේවල් සඳහා Case sensitive විය යුතු නිසා lowercase නොකරයි
        
        if (!validSettings.includes(settingName)) {
            return reply(`❌ *Invalid Setting:* ${settingName}`);
        }

        let updateValue;

        // Boolean (True/False) සෙටින්ග්ස් සඳහා
        if (['AUTO_CALL_END', 'AUTO_MG_REACT', 'AUTO_STATUS_SEEN', 'AUTO_STATUS_REACT'].includes(settingName)) {
            let val = inputVal.toLowerCase();
            if (val !== 'true' && val !== 'false') return reply("❌ කරුණාකර අගය *true* හෝ *false* ලෙස ඇතුළත් කරන්න.");
            updateValue = (val === 'true');
        } 
        // Work Type සඳහා
        else if (settingName === 'WORK_TYPE') {
            let val = inputVal.toLowerCase();
            if (val !== 'public' && val !== 'private') return reply("❌ Work Type එක *public* හෝ *private* විය යුතුය.");
            updateValue = val;
        }
        // Prefix සහ අනෙකුත් දේවල් සඳහා
        else {
            updateValue = inputVal;
        }

        // Database Update
        await Settings.findOneAndUpdate(
            { id: 'main_settings' }, 
            { [settingName]: updateValue }, 
            { upsert: true, new: true }
        );

        return reply(`✅ *CONFIG UPDATED*\n\n⚙️ *Setting:* ${settingName}\n✨ *New Value:* ${updateValue}`);

    } catch (e) {
        console.error("Config Error:", e);
        return reply("❌ Database update error.");
    }
});

// --- GET CONFIG COMMAND ---
cmd({
    pattern: "getconfig",
    alias: ["settings", "allconfig", "status"],
    react: "🧑‍💻",
    desc: "Show current configurations",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, isOwner }) => {
    try {
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber || isOwner;

        if (!isBotOwner) {
            return reply("⚠️ *PREMIUM FEATURE* ⚠️");
        }

        let data = await Settings.findOne({ id: 'main_settings' });
        
        if (!data) {
            // දත්ත නැත්නම් Default දත්ත සෑදීම
            data = await Settings.create({ 
                id: 'main_settings',
                AUTO_CALL_END: false,
                AUTO_MG_REACT: false,
                AUTO_STATUS_SEEN: false,
                AUTO_STATUS_REACT: false,
                WORK_TYPE: 'public',
                PREFIX: '.'
            });
        }
        
        let msg = "✨ 『 *OSHIYA-MD PREMIUM STATUS* 』 ✨\n\n";
        msg += `🌍 *Work Mode:* ${data.WORK_TYPE.toUpperCase()}\n`;
        msg += `🔑 *Prefix:* ${data.PREFIX}\n`;
        msg += `🛡️ *Auto Call End:* ${data.AUTO_CALL_END ? '🟢 ON' : '🔴 OFF'}\n`;
        msg += `⚡ *Auto Msg React:* ${data.AUTO_MG_REACT ? '🟢 ON' : '🔴 OFF'}\n`;
        msg += `👁️ *Auto Status Seen:* ${data.AUTO_STATUS_SEEN ? '🟢 ON' : '🔴 OFF'}\n`;
        msg += `💖 *Auto Status React:* ${data.AUTO_STATUS_REACT ? '🟢 ON' : '🔴 OFF'}\n\n`;
        msg += `💡 *Tip:* Use \`.use PREFIX ! \` to change bot prefix.`;
        
        return reply(msg);

    } catch (e) {
        console.error("GetConfig Error:", e);
        return reply("❌ Data retrieval error.");
    }
});
