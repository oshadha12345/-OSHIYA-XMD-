const { cmd } = require('../command');
const { Settings } = require('../lib/mongodb');

// පොදු සැකසුම් (Styling Constants)
const theme = {
    header: "╭━━━〔 *OSHIYA-MD CONFIG* 〕━━━┈⊷",
    footer: "╰━━━━━━━━━━━━━━━┈⊷",
    line: "┃",
    bullet: "⚡",
    success: "✅",
    error: "❌",
    warning: "⚠️"
};

// --- CONFIG UPDATE COMMAND ---
cmd({
    pattern: "use",
    alias: ["set", "apply", "updateconfig"],
    react: "⚙️",
    desc: "Update bot configurations (Owner only)",
    category: "owner",
    use: ".use WORK_TYPE private",
    filename: __filename
},
async (test, mek, m, { args, reply, isOwner }) => {
    try {
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber || isOwner;

        if (!isBotOwner) return reply(`${theme.warning} *ACCESS DENIED* ${theme.warning}\n\nමෙය හිමිකරුට පමණක් භාවිතා කළ හැක.`);

        const validSettings = [
            'AUTO_CALL_END', 
            'AUTO_MG_REACT', 
            'AUTO_STATUS_SEEN', 
            'AUTO_STATUS_REACT',
            'WORK_TYPE', 
            'PREFIX'
        ];

        // arguments නොමැති නම් උපදෙස් මාලාව පෙන්වීම
        if (args.length < 2) {
            let list = `${theme.header}\n${theme.line}\n`;
            list += `${theme.line} 📝 *Usage:* .apply [setting] [value]\n`;
            list += `${theme.line} 💡 *Example:* .apply PREFIX !\n${theme.line}\n`;
            list += `${theme.line} ✨ *AVAILABLE SETTINGS* ✨\n`;
            validSettings.forEach(s => {
                list += `${theme.line}  ${theme.bullet} ${s}\n`;
            });
            list += `${theme.line}\n${theme.footer}`;
            return reply(list);
        }

        const settingName = args[0].toUpperCase();
        let inputVal = args[1];
        
        if (!validSettings.includes(settingName)) {
            return reply(`${theme.error} *Invalid Setting:* \`${settingName}\` \nනැවත උත්සාහ කරන්න.`);
        }

        let updateValue;

        // Boolean Settings logic
        if (['AUTO_CALL_END', 'AUTO_MG_REACT', 'AUTO_STATUS_SEEN', 'AUTO_STATUS_REACT'].includes(settingName)) {
            let val = inputVal.toLowerCase();
            if (val !== 'true' && val !== 'false') return reply(`${theme.error} කරුණාකර අගය *true* හෝ *false* ලෙස ඇතුළත් කරන්න.`);
            updateValue = (val === 'true');
        } 
        // Work Type logic
        else if (settingName === 'WORK_TYPE') {
            let val = inputVal.toLowerCase();
            if (val !== 'public' && val !== 'private') return reply(`${theme.error} Work Type එක *public* හෝ *private* විය යුතුය.`);
            updateValue = val;
        }
        else {
            updateValue = inputVal;
        }

        // Database Update
        await Settings.findOneAndUpdate(
            { id: 'main_settings' }, 
            { [settingName]: updateValue }, 
            { upsert: true, new: true }
        );

        let successMsg = `*${theme.success} CONFIGURATION UPDATED ✅* \n\n`;
        successMsg += `💠 *Setting:* ${settingName}\n`;
        successMsg += `✨ *New Value:* ${updateValue}\n\n`;
        successMsg += `> *OSHIYA-MD System Updated*`;

        return reply(successMsg);

    } catch (e) {
        console.error("Config Error:", e);
        return reply(`${theme.error} *Database error!* \nConsole එක පරීක්ෂා කරන්න.`);
    }
});

// --- GET CONFIG/STATUS COMMAND ---
cmd({
    pattern: "setting",
    alias: ["settings", "allconfig", "status", "panel"],
    react: "📊",
    desc: "Show current configurations",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, isOwner }) => {
    try {
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber || isOwner;

        if (!isBotOwner) return reply("⚠️ *OWNER ONLY FEATURE* ⚠️");

        let data = await Settings.findOne({ id: 'main_settings' });
        
        if (!data) {
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

        const statusIcon = (val) => val ? '🟩 ON' : '🟥 OFF';
        
        let msg = `✨ *OSHIYA-MD CONTROL PANEL* ✨\n\n`;
        msg += `┏━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n`;
        msg += `┃ 🌐 *Mode:* ${data.WORK_TYPE.toUpperCase()}\n`;
        msg += `┃ ⌨️ *Prefix:* [ ${data.PREFIX} ]\n`;
        msg += `┠━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n`;
        msg += `┃ 📞 *Auto Call End:* ${statusIcon(data.AUTO_CALL_END)}\n`;
        msg += `┃ ⚡ *Auto Msg React:* ${statusIcon(data.AUTO_MG_REACT)}\n`;
        msg += `┃ 👁️ *Status Seen:* ${statusIcon(data.AUTO_STATUS_SEEN)}\n`;
        msg += `┃ 💖 *Status React:* ${statusIcon(data.AUTO_STATUS_REACT)}\n`;
        msg += `┗━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        msg += `💡 *Change:* Use \`.apply 🧑‍💻`;
        
        return reply(msg);

    } catch (e) {
        console.error("GetConfig Error:", e);
        return reply("❌ Data retrieval error.");
    }
});
