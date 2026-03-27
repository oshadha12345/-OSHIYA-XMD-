const { cmd } = require('../command'); // ඔබේ command handler එකට අනුව වෙනස් කරන්න
const mongoose = require('mongoose');

cmd({
    pattern: "config",
    alias: ["settings", "set"],
    desc: "Update bot configurations",
    category: "owner",
    use: ".config AUTO_STATUS_SEEN true",
    filename: __filename
},
async (test, mek, m, { args, reply, isOwner, prefix }) => {
    if (!isOwner) return reply("❌ මෙම විධානය භාවිත කළ හැක්කේ Owner ට පමණි.");
    if (args.length < 2) return reply(`*Usage:* ${prefix}config [Setting_Name] [true/false]\n\n*Available Settings:* \n- AUTO_CALL_END\n- AUTO_MG_REACT\n- AUTO_STATUS_SEEN\n- AUTO_STATUS_REACT`);

    const settingName = args[0].toUpperCase();
    const value = args[1].toLowerCase() === 'true';
    const Settings = mongoose.model('Settings');

    // වලංගු settings දැයි පරීක්ෂා කිරීම
    const validSettings = ['AUTO_CALL_END', 'AUTO_MG_REACT', 'AUTO_STATUS_SEEN', 'AUTO_STATUS_REACT'];
    if (!validSettings.includes(settingName)) {
        return reply(`❌ වලංගු නොවන setting එකක්: ${settingName}`);
    }

    try {
        await Settings.findOneAndUpdate({ id: 'main_settings' }, { [settingName]: value });
        return reply(`✅ *${settingName}* සාර්ථකව *${value ? 'ON' : 'OFF'}* කරන ලදී.`);
    } catch (e) {
        console.error(e);
        return reply("❌ Database එක update කිරීමේදී දෝෂයක් සිදුවිය.");
    }
});

// වත්මන් settings පෙන්වීමට command එකක්
cmd({
    pattern: "getconfig",
    desc: "Show current bot configurations",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply("Owner only.");
    const Settings = mongoose.model('Settings');
    const data = await Settings.findOne({ id: 'main_settings' });
    
    let msg = "*OSHIYA-MD CURRENT CONFIG*\n\n";
    msg += `📞 Auto Call End: ${data.AUTO_CALL_END ? '✅' : '❌'}\n`;
    msg += `💬 Auto Msg React: ${data.AUTO_MG_REACT ? '✅' : '❌'}\n`;
    msg += `👁️ Auto Status Seen: ${data.AUTO_STATUS_SEEN ? '✅' : '❌'}\n`;
    msg += `✨ Auto Status React: ${data.AUTO_STATUS_REACT ? '✅' : '❌'}`;
    
    return reply(msg);
});
