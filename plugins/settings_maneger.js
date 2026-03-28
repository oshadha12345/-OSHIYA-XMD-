const { cmd } = require('../command');
const { Settings } = require('../lib/mongodb');

// ===== SETTINGS NUMBER MAP =====
const settingMap = {
    1: 'AUTO_CALL_END',
    2: 'AUTO_MG_REACT',
    3: 'AUTO_STATUS_SEEN',
    4: 'AUTO_STATUS_REACT',
    5: 'WORK_TYPE',
    6: 'PREFIX'
};

// ===== STATUS ICON =====
const statusIcon = (val) => val ? '🟩 ON' : '🟥 OFF';

// =============================
// 🔧 UPDATE USING COMMAND (.use)
// =============================
cmd({
    pattern: "use",
    alias: ["set", "apply"],
    desc: "Update config",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { args, reply, isOwner }) => {

    const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotOwner = m.sender === botNumber || isOwner;
    if (!isBotOwner) return reply("⚠️ OWNER ONLY");

    const validSettings = Object.values(settingMap);

    if (args.length < 2) {
        return reply(`❌ Example:\n.use AUTO_CALL_END true`);
    }

    const settingName = args[0].toUpperCase();
    let value = args[1].toLowerCase();

    if (!validSettings.includes(settingName)) {
        return reply("❌ Invalid setting");
    }

    let updateValue;

    if (['AUTO_CALL_END','AUTO_MG_REACT','AUTO_STATUS_SEEN','AUTO_STATUS_REACT'].includes(settingName)) {
        if (value !== 'true' && value !== 'false') return reply("❌ true / false only");
        updateValue = value === 'true';
    } 
    else if (settingName === 'WORK_TYPE') {
        if (value !== 'public' && value !== 'private') return reply("❌ public/private only");
        updateValue = value;
    } 
    else {
        updateValue = args[1];
    }

    await Settings.findOneAndUpdate(
        { id: 'main_settings' },
        { [settingName]: updateValue },
        { upsert: true }
    );

    return reply(`✅ Updated\n${settingName} → ${updateValue}`);
});

// =============================
// 📊 SHOW SETTINGS (NUMBER UI)
// =============================
cmd({
    pattern: "setting",
    alias: ["settings","panel"],
    desc: "Show config",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, isOwner }) => {

    const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotOwner = m.sender === botNumber || isOwner;
    if (!isBotOwner) return reply("⚠️ OWNER ONLY");

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

    let msg = `✨ *OSHIYA-MD CONTROL PANEL* ✨\n\n`;

    msg += `1️⃣ Auto Call End : ${statusIcon(data.AUTO_CALL_END)}\n`;
    msg += `2️⃣ Auto Msg React : ${statusIcon(data.AUTO_MG_REACT)}\n`;
    msg += `3️⃣ Status Seen : ${statusIcon(data.AUTO_STATUS_SEEN)}\n`;
    msg += `4️⃣ Status React : ${statusIcon(data.AUTO_STATUS_REACT)}\n`;
    msg += `5️⃣ Work Type : ${data.WORK_TYPE}\n`;
    msg += `6️⃣ Prefix : ${data.PREFIX}\n\n`;

    msg += `💡 Reply to this message:\n`;
    msg += `👉 1 on / 1 off\n`;
    msg += `👉 5 public / private\n`;
    msg += `👉 6 !\n`;

    return reply(msg);
});

// =============================
// 🔥 REPLY HANDLER (1 on / off)
// =============================
cmd({
    on: "text"
},
async (test, mek, m, { reply, isOwner }) => {
    try {

        if (!m.quoted) return;

        const botNumber = test.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotOwner = m.sender === botNumber || isOwner;
        if (!isBotOwner) return;

        let text = m.text.toLowerCase().trim();
        let [num, value] = text.split(" ");

        if (!num || !value) return;

        let settingName = settingMap[num];
        if (!settingName) return;

        let updateValue;

        // Boolean settings
        if (['AUTO_CALL_END','AUTO_MG_REACT','AUTO_STATUS_SEEN','AUTO_STATUS_REACT'].includes(settingName)) {
            if (value !== 'on' && value !== 'off') return reply("❌ Use on/off");
            updateValue = (value === 'on');
        }

        // Work type
        else if (settingName === 'WORK_TYPE') {
            if (value !== 'public' && value !== 'private') return reply("❌ public / private only");
            updateValue = value;
        }

        // Prefix
        else if (settingName === 'PREFIX') {
            updateValue = value;
        }

        await Settings.findOneAndUpdate(
            { id: 'main_settings' },
            { [settingName]: updateValue },
            { upsert: true }
        );

        return reply(`✅ Updated\n\n${settingName} → ${updateValue}`);

    } catch (e) {
        console.error(e);
        reply("❌ Error updating");
    }
});
