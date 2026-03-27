const { cmd } = require('../command');
// lib/mongodb.js එකෙන් Settings model එක import කරගන්න
const { Settings } = require('../lib/mongodb'); 

cmd({
    pattern: "config",
    alias: ["settings", "set"],
    desc: "Update bot configurations",
    category: "owner",
    use: ".config AUTO_STATUS_SEEN true",
    filename: __filename
},
async (test, mek, m, { args, reply, isOwner, prefix }) => {
    try {
        if (!isOwner) return reply("❌ මෙම විධානය භාවිත කළ හැක්කේ Owner ට පමණි.");
        
        // Args පරීක්ෂාව
        if (args.length < 2) {
            return reply(`*OSHIYA-MD CONFIGURATION*\n\n*Usage:* ${prefix}config [Setting_Name] [true/false]\n\n*Available Settings:* \n- AUTO_CALL_END\n- AUTO_MG_REACT\n- AUTO_STATUS_SEEN\n- AUTO_STATUS_REACT`);
        }

        const settingName = args[0].toUpperCase();
        const inputVal = args[1].toLowerCase();
        
        // වලංගු settings දැයි පරීක්ෂා කිරීම
        const validSettings = ['AUTO_CALL_END', 'AUTO_MG_REACT', 'AUTO_STATUS_SEEN', 'AUTO_STATUS_REACT'];
        
        if (!validSettings.includes(settingName)) {
            return reply(`❌ වලංගු නොවන setting එකක්: ${settingName}\n\nභාවිතා කළ හැකි ඒවා: ${validSettings.join(', ')}`);
        }

        if (inputVal !== 'true' && inputVal !== 'false') {
            return reply("❌ අගය 'true' හෝ 'false' විය යුතුය.");
        }

        const value = inputVal === 'true';

        // Database එක update කිරීම
        const updated = await Settings.findOneAndUpdate(
            { id: 'main_settings' }, 
            { [settingName]: value }, 
            { upsert: true, new: true }
        );

        return reply(`✅ *${settingName}* සාර්ථකව *${value ? 'ON (true)' : 'OFF (false)'}* කරන ලදී.`);

    } catch (e) {
        console.error(e);
        return reply("❌ Database එක update කිරීමේදී දෝෂයක් සිදුවිය.");
    }
});

// වත්මන් settings පෙන්වීමට command එකක්
cmd({
    pattern: "getconfig",
    alias: ["status", "allconfig"],
    desc: "Show current bot configurations",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, isOwner }) => {
    try {
        if (!isOwner) return reply("Owner only.");

        let data = await Settings.findOne({ id: 'main_settings' });
        
        // දත්ත නොමැති නම් default දත්ත සාදන්න
        if (!data) {
            data = await Settings.create({ id: 'main_settings' });
        }
        
        let msg = "⚙️ *OSHIYA-MD CURRENT CONFIG*\n\n";
        msg += `📞 *Auto Call End:* ${data.AUTO_CALL_END ? '✅ (ON)' : '❌ (OFF)'}\n`;
        msg += `💬 *Auto Msg React:* ${data.AUTO_MG_REACT ? '✅ (ON)' : '❌ (OFF)'}\n`;
        msg += `👁️ *Auto Status Seen:* ${data.AUTO_STATUS_SEEN ? '✅ (ON)' : '❌ (OFF)'}\n`;
        msg += `✨ *Auto Status React:* ${data.AUTO_STATUS_REACT ? '✅ (ON)' : '❌ (OFF)'}\n\n`;
        msg += `*Tip:* පාලනය කිරීමට ${prefix}config [Name] true/false භාවිතා කරන්න.`;
        
        return reply(msg);

    } catch (e) {
        console.error(e);
        return reply("❌ දත්ත කියවීමේදී දෝෂයක් සිදුවිය.");
    }
});


