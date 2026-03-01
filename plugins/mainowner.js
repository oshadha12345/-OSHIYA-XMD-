const config = require('../config')
const {cmd , commands} = require('../command')
const os = require("os")
const { exec } = require('child_process')
const {runtime} = require('../lib/functions')

// ================= OWNER INFO =================//

cmd({
    pattern: "owner",
    desc: "Owner details",
    category: "main",
    react: "👑",
    filename: __filename
},
async(conn, mek, m,{from, pushname}) => {
try{

let dec = `╭━━〔 👑 ᴏꜱʜɪʏᴀ-xᴍᴅ ᴏᴡɴᴇʀ 👑 〕━━⬣
┃ 👋 ʜᴇʟʟᴏ *${pushname}*
┃ 👤 ᴏᴡɴᴇʀ : ᴏꜱʜᴀᴅʜᴀ
┃ 📞 ɴᴜᴍʙᴇʀ : wa.me/94756599952
┃ 🌐 ɢɪᴛʜᴜʙ : github.com/oshadha12345
╰━━━━━━━━━━━━━━━━━━⬣
> 💎 ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴏꜱʜɪʏᴀ-xᴍᴅ`;

await conn.sendMessage(from,{image:{url:config.MENU_IMG},caption:dec},{quoted:mek});

}catch(e){
console.log(e)
}
});

cmd({
    pattern: "repo",
    desc: "Bot repository",
    react: "📦",
    category: "main",
    filename: __filename
},
async(conn, mek, m,{from}) => {
try{

let dec = `╭━━〔 📂 ᴏꜱʜɪʏᴀ-xᴍᴅ ʀᴇᴘᴏ 〕━━⬣
┃ 🔗 ɢɪᴛʜᴜʙ :
┃ https://github.com/oshadha12345/-OSHIYA-XMD-
┃
┃ ⭐ ꜱᴛᴀʀ ᴛʜᴇ ʀᴇᴘᴏ ɪꜰ ʏᴏᴜ ʟɪᴋᴇ ɪᴛ
╰━━━━━━━━━━━━━━━━━━⬣
> 🚀 ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ ᴏꜱʜᴀᴅʜᴀ`;

await conn.sendMessage(from,{image:{url:config.MENU_IMG},caption:dec},{quoted:mek});

}catch(e){
console.log(e)
}
});
//=============SYSTEM==================//
cmd({
    pattern: "system",
    alias: ["status","botinfo"],
    react: "🔥",
    desc: "Check system status",
    category: "main",
    filename: __filename
},
async(conn, mek, m,{reply}) => {
try{

let status = `
╭━━〔 🤖 ᴏꜱʜɪʏᴀ-xᴍᴅ ꜱʏꜱᴛᴇᴍ 〕━━⬣
┃ ⏳ ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}
┃ 💾 ʀᴀᴍ : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
┃ 🖥️ ʜᴏꜱᴛ : ${os.hostname()}
┃ ⚙️ ᴠᴇʀꜱɪᴏɴ : 3.0.0 ᴘʀᴇᴍɪᴜᴍ
╰━━━━━━━━━━━━━━━━━━⬣
> 💎 ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴏꜱʜɪʏᴀ-xᴍᴅ`;

reply(status)

}catch(e){
console.log(e)
}
})
//===============RESTART===================//
cmd({
    pattern: "restart",
    desc: "Restart bot",
    react :"🔄",
    category: "owner",
    filename: __filename
},
async(conn, mek, m,{isOwner, reply}) => {
try{
if(!isOwner) return reply("❌ ᴏɴʟʏ ᴏᴡɴᴇʀ");

reply("🔄 ʀᴇꜱᴛᴀʀᴛɪɴɢ...");
setTimeout(() => {
exec("pm2 restart all")
}, 2000);

}catch(e){
console.log(e)
}
})
