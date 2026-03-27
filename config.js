const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "ᴏꜱʜɪʏᴀ~KNFE3IKQ#8VKUgoAfrsQfD4lLE3EfmO11VW3Kh0vH803TYX-oyHo",
OWNER_NAME: process.env.OWNER_NAME || "Oshiya💗",
OWNER_NUMBER: '94712849964',
AUTO_STATUS_SEND: process.env.AUTO_STATUS_SEND || "false",
MODE: "public",
PREFIX: ".",
AUTO_STATUS_SEEN: 'false',
AUTO_STATUS_REACT: 'false',
AUTO_CALL_END: 'true',
AUTO_MG_REACT: 'true',
NEWSLETTER_JID: "120363424190990486@newsletter",
GROUP_INVITE_LINK: "https://chat.whatsapp.com/FGZiHK4LtN9IQSIWHfOSib",



};
