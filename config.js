const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "ᴏꜱʜɪʏᴀ~ScVFUJpB#cIL7VAYyyTGBagvQNLqFV_kXOA0mJuBGVj2iokqL-Pk",
OWNER_NAME: process.env.OWNER_NAME || "Oshiya💗",
AUTO_STATUS_SEND: process.env.AUTO_STATUS_SEND || "true",
MODE: "public",
PREFIX: ".",
AUTO_STATUS_SEEN: 'true',
AUTO_STATUS_REACT: 'true',
NEWSLETTER_JID: "120363424190990486@newsletter",
GROUP_INVITE_LINK: "https://chat.whatsapp.com/FGZiHK4LtN9IQSIWHfOSib",
AUTO_CHANNEL_LINK: "https://whatsapp.com/channel/0029Vb7LPVyGk1FlVN1bPz43/154",



};
