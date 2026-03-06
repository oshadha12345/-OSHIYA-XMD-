const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "ᴏꜱʜɪʏᴀ~CBlxUZBR#YaH1ccJ_DekbwuRRvSFfAuznoPKZ4o8MAEVZLGQ7N_o",
OWNER_NAME: process.env.OWNER_NAME || "Oshiya💗",
BOT_NAME: process.env.BOT_NAME || "OSHIYA😾",
BOT_OWNER: '94725364886',  // Replace with the owner's phone number
AUTO_STATUS_SEND: process.env.AUTO_STATUS_SEND || "true",
MODE: "group",
AUTO_STATUS_SEEN: 'true',
AUTO_STATUS_REACT: 'true',
NEWSLETTER_JID: "120363424190990486@newsletter",
GROUP_INVITE_LINK: "https://chat.whatsapp.com/FGZiHK4LtN9IQSIWHfOSib",



};
