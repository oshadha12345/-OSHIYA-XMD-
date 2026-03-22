const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "ᴏꜱʜɪʏᴀ~iB9gDDbQ#KlDjgP87WbzXJkjvBku_5l4_a3sSOLEWSxJbMF-wj1U",
OWNER_NAME: process.env.OWNER_NAME || "Oshiya💗",
OWNER_NUMBER: '94712849964',
AUTO_STATUS_SEND: process.env.AUTO_STATUS_SEND || "false",
AUTO_REACT: process.env.AUTO_REACT || "true", // true හෝ false ලෙස සකසන්න 
AUTO_REACT_EMOJIS: process.env.AUTO_REACT_EMOJIS || '❤️,😂,🔥,✨,💯,👍,✅', 
MODE: "public",
PREFIX: ".",
AUTO_STATUS_SEEN: 'false',
AUTO_STATUS_REACT: 'false',
AUTO_ONLINE: 'true',      // always online
AUTO_TYPING: 'false',      // typing status  AUTO_RECORDING: false   //
AUTO_RECORDING: 'true',
AUTO_CALL_END: 'true',
NEWSLETTER_JID: "120363424190990486@newsletter",
GROUP_INVITE_LINK: "https://chat.whatsapp.com/FGZiHK4LtN9IQSIWHfOSib",



};
