const { cmd } = require('../command');
const { Settings } = require('../lib/mongodb');

// --- PREMIUM UI THEME ---
const ui = {
    header: "🧑‍💻 ᴏꜱʜɪʏᴀ-ᴍᴅ 🧑‍💻",
    line: "┃",
    divider: "┠━━━━━━━━━━━━━━━━━━━━━━┈⊷",
    bottom: "┗━━━━━━━━━━━━━━━━━━━━━━┈⊷",
    bullet: "✨",
    on: "🟢 ON",
    off: "🔴 OFF",
    success: "✅",
    error: "❌",
    warn: "⚠️"
};

// --- CONFIGURATION APPLY COMMAND ---
cmd({
    pattern: "apply",
    alias: ["set", "update"],
    react: "⚙️",
    desc: "Update configurations using numbers",
    category: "owner",
    use: ".apply 1 on",
    filename: __filename
},
async (test, mek, m, { args, reply, isOwner }) => {
    try {
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber || isOwner;
        if (!isBotOwner) return reply(`${ui.warn} *ACCESS DENIED* \nමෙය හිමිකරුට පමණක් සීමා වේ.`);

        // Setting Map (ඉල්ලීම පරිදි සකස් කළ ලැයිස්තුව)
        const settingMap = {
            "1": "AUTO_CALL_END",
            "2": "AUTO_MG_REACT",
            "3": "AUTO_STATUS_SEEN",
            "4": "AUTO_STATUS_REACT",
            "5": "PREFIX"
        };

        if (args.length < 2) {
            return reply(`${ui.warn} *වැරදි භාවිතයක්!* \n\n💡 උදාහරණ:\n.apply 1 on (Call End On කිරීමට)\n.apply 5 ! (Prefix එක වෙනස් කිරීමට)`);
        }

        const choice = args[0];
        const inputVal = args[1].toLowerCase();
        const settingName = settingMap[choice];

        if (!settingName) return reply(`${ui.error} *අංකය වැරදියි!* \nකරුණාකර 1 සිට 5 දක්වා අංකයක් භාවිතා කරන්න.`);

        let updateValue;
        
        // Boolean conversion (1-4 settings සඳහා)
        if (choice !== "5") {
            if (inputVal === 'on' || inputVal === 'true' || inputVal === '1') {
                updateValue = true;
            } else if (inputVal === 'off' || inputVal === 'false' || inputVal === '0') {
                updateValue = false;
            } else {
                return reply(`${ui.error} කරුණාකර අගය *on* හෝ *off* ලෙස ඇතුළත් කරන්න.`);
            }
        } else {
            // Prefix සඳහා
            updateValue = args[1];
        }

        // Database Update
        await Settings.findOneAndUpdate(
            { id: 'main_settings' }, 
            { [settingName]: updateValue }, 
            { upsert: true }
        );

        return reply(`${ui.success} *SETTING UPDATED*\n\n⚙️ *Property:* ${settingName}\n✨ *New State:* ${updateValue === true ? ui.on : (updateValue === false ? ui.off : updateValue)}`);

    } catch (e) {
        console.error(e);
        return reply(`${ui.error} *Database Error!*`);
    }
});

// --- STATUS / PANEL COMMAND ---
cmd({
    pattern: "panel",
    alias: ["setting", "settings", "status"],
    react: "📊",
    desc: "Show premium control panel",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, isOwner }) => {
    try {
        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber || isOwner;
        if (!isBotOwner) return reply(`${ui.warn} *OWNER ONLY*`);

        let data = await Settings.findOne({ id: 'main_settings' });
        if (!data) {
            data = await Settings.create({ 
                id: 'main_settings',
                AUTO_CALL_END: false,
                AUTO_MG_REACT: false,
                AUTO_STATUS_SEEN: false,
                AUTO_STATUS_REACT: false,
                PREFIX: '.'
            });
        }

        const getStatus = (val) => val ? ui.on : ui.off;

        let panel = `      ${ui.header}\n\n`;
        panel += `┏━━━━━━━━━━━━━━━━━━━━━━┈⊷\n`;
        panel += `┃ [ 1 ] *Auto Call End* : ${getStatus(data.AUTO_CALL_END)}\n`;
        panel += `┃ [ 2 ] *Auto Msg React*: ${getStatus(data.AUTO_MG_REACT)}\n`;
        panel += `┃ [ 3 ] *Status Seen* : ${getStatus(data.AUTO_STATUS_SEEN)}\n`;
        panel += `┃ [ 4 ] *Status React* : ${getStatus(data.AUTO_STATUS_REACT)}\n`;
        panel += `┃ [ 5 ] *Bot Prefix* : [ ${data.PREFIX} ]\n`;
        panel += `${ui.bottom}\n\n`;
        panel += `📝 *සැකසුම් වෙනස් කිරීමට:* \n\`.apply [Number] [on/off]\` භාවිතා කරන්න.\n\n`;
        panel += `> *ᴏꜱʜɪʏᴀ ᴍᴅ 🧑‍💻*`;

        return reply(panel);

    } catch (e) {
        console.error(e);
        return reply("❌ Error fetching settings.");
    }
});
