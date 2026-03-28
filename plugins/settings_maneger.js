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
    use: ".use 1",
    filename: __filename
},
async (test, mek, m, { args, reply, isOwner }) => {
    try {
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber || isOwner;

        if (!isBotOwner) return reply(`${theme.warning} *ACCESS DENIED* ${theme.warning}\n\nමෙය හිමිකරුට පමණක් භාවිතා කළ හැක.`);

        // Settings Mapping using numbers
        const configMap = {
            "1":   { name: "AUTO_CALL_END", value: true },
            "1.1": { name: "AUTO_CALL_END", value: false },
            "2":   { name: "AUTO_MG_REACT", value: true },
            "2.1": { name: "AUTO_MG_REACT", value: false },
            "3":   { name: "AUTO_STATUS_SEEN", value: true },
            "3.1": { name: "AUTO_STATUS_SEEN", value: false },
            "4":   { name: "AUTO_STATUS_REACT", value: true },
            "4.1": { name: "AUTO_STATUS_REACT", value: false },
            "5":   { name: "WORK_TYPE", value: "public" },
            "5.1": { name: "WORK_TYPE", value: "private" }
        };

        // අංකය ඇතුළත් කර නැතිනම් Menu එක පෙන්වීම
        if (!args[0] || !configMap[args[0]]) {
            let list = `${theme.header}\n${theme.line}\n`;
            list += `${theme.line} 📝 *Usage:* .apply [Number]\n${theme.line}\n`;
            
            list += `${theme.line} 📞 *AUTO CALL END*\n`;
            list += `${theme.line}    1 ➔ ON | 1.1 ➔ OFF\n${theme.line}\n`;
            
            list += `${theme.line} ⚡ *AUTO MSG REACT*\n`;
            list += `${theme.line}    2 ➔ ON | 2.1 ➔ OFF\n${theme.line}\n`;
            
            list += `${theme.line} 👁️ *AUTO STATUS SEEN*\n`;
            list += `${theme.line}    3 ➔ ON | 3.1 ➔ OFF\n${theme.line}\n`;
            
            list += `${theme.line} 💖 *AUTO STATUS REACT*\n`;
            list += `${theme.line}    4 ➔ ON | 4.1 ➔ OFF\n${theme.line}\n`;
            
            list += `${theme.line} 🌐 *WORK MODE*\n`;
            list += `${theme.line}    5 ➔ PUBLIC | 5.1 ➔ PRIVATE\n${theme.line}\n`;
            
            list += `${theme.footer}`;
            return reply(list);
        }

        const selected = configMap[args[0]];
        const settingName = selected.name;
        const updateValue = selected.value;

        // Database Update
        await Settings.findOneAndUpdate(
            { id: 'main_settings' }, 
            { [settingName]: updateValue }, 
            { upsert: true, new: true }
        );

        let successMsg = `*${theme.success} CONFIGURATION UPDATED ✅* \n\n`;
        successMsg += `💠 *Setting:* ${settingName.replace(/_/g, ' ')}\n`;
        successMsg += `✨ *New Value:* ${updateValue === true ? 'ON' : updateValue === false ? 'OFF' : updateValue.toUpperCase()}\n\n`;
        successMsg += `> *OSHIYA-MD System Updated*`;

        return reply(successMsg);

    } catch (e) {
        console.error("Config Error:", e);
        return reply(`${theme.error} *Database error!*`);
    }
});

// --- GET CONFIG/STATUS PANEL ---
cmd({
    pattern: "setting",
    alias: ["settings", "panel", "status"],
    react: "📊",
    desc: "Show current configurations",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, isOwner }) => {
    try {
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber || isOwner;

        if (!isBotOwner) return reply("⚠️ *OWNER ONLY*");

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
        msg += `┃ 📞 *Auto Call End:* ${statusIcon(data.AUTO_CALL_END)} (1 / 1.1)\n`;
        msg += `┃ ⚡ *Auto Msg React:* ${statusIcon(data.AUTO_MG_REACT)} (2 / 2.1)\n`;
        msg += `┃ 👁️ *Status Seen:* ${statusIcon(data.AUTO_STATUS_SEEN)} (3 / 3.1)\n`;
        msg += `┃ 💖 *Status React:* ${statusIcon(data.AUTO_STATUS_REACT)} (4 / 4.1)\n`;
        msg += `┗━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        msg += `💡 *Quick Change:* Use \`.apply [Number]\``;
        
        return reply(msg);

    } catch (e) {
        return reply("❌ Data retrieval error.");
    }
});
