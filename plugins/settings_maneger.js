const { cmd } = require('../command');
const { Settings } = require('../lib/mongodb'); 

cmd({
    pattern: "apply",
    alias: ["set", "use", "config"],
    react: "⚙️",
    desc: "Update bot settings",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { args, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("⚠️ *OWNER ONLY*");

        const validSettings = ['AUTO_CALL_END', 'AUTO_MG_REACT', 'AUTO_STATUS_SEEN', 'AUTO_STATUS_REACT', 'WORK_TYPE', 'PREFIX'];

        if (args.length < 2) {
            return reply(`💡 *Usage:* .use [setting] [value]\n\n*Options:* ${validSettings.join(', ')}`);
        }

        const settingName = args[0].toUpperCase();
        const inputVal = args[1]; // Prefix Case sensitive විය හැක

        if (!validSettings.includes(settingName)) return reply("❌ Invalid Setting.");

        let finalValue;

        // Boolean (True/False) handle කිරීම
        if (['AUTO_CALL_END', 'AUTO_MG_REACT', 'AUTO_STATUS_SEEN', 'AUTO_STATUS_REACT'].includes(settingName)) {
            if (inputVal.toLowerCase() !== 'true' && inputVal.toLowerCase() !== 'false') return reply("❌ Use true/false");
            finalValue = (inputVal.toLowerCase() === 'true');
        } 
        // Work Type handle කිරීම
        else if (settingName === 'WORK_TYPE') {
            if (inputVal.toLowerCase() !== 'public' && inputVal.toLowerCase() !== 'private') return reply("❌ Use public/private");
            finalValue = inputVal.toLowerCase();
        } 
        // Prefix handle කිරීම
        else {
            finalValue = inputVal;
        }

        await Settings.findOneAndUpdate({ id: 'main_settings' }, { [settingName]: finalValue }, { upsert: true });
        
        return reply(`✅ *${settingName}* updated to: *${finalValue}*`);

    } catch (e) {
        reply("❌ Error updating database.");
    }
});

// Settings බැලීම සඳහා
cmd({
    pattern: "status",
    alias: ["getconfig", "settings"],
    react: "📊",
    category: "owner",
    filename: __filename
},
async (test, mek, m, { reply, isOwner }) => {
    if (!isOwner) return reply("⚠️ *OWNER ONLY*");
    
    let data = await Settings.findOne({ id: 'main_settings' });
    let msg = `✨ *OSHIYA-MD CONFIG* ✨\n\n`;
    msg += `🌍 *Mode:* ${data.WORK_TYPE}\n`;
    msg += `🔑 *Prefix:* ${data.PREFIX}\n`;
    msg += `🛡️ *Auto Call End:* ${data.AUTO_CALL_END ? 'ON' : 'OFF'}\n`;
    msg += `⚡ *Auto React:* ${data.AUTO_MG_REACT ? 'ON' : 'OFF'}\n`;
    msg += `👁️ *Status Seen:* ${data.AUTO_STATUS_SEEN ? 'ON' : 'OFF'}\n`;
    msg += `👁️ *Status React:* ${data.AUTO_STATUS_REACT ? 'ON' : 'OFF'}\n`;
    
    return reply(msg);
});
