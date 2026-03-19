const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "ᴏꜱʜɪʏᴀ~bM0S1QYT#hBPfT6JfXn-92o0d9qrT5C5sYKJaaphRlpsrF15-c4E",
OWNER_NAME: process.env.OWNER_NAME || "Oshiya💗",
OWNER_NUMBER: '94725364886',
AUTO_STATUS_SEND: process.env.AUTO_STATUS_SEND || "true",
MODE: "public",
PREFIX: ".",
AUTO_STATUS_SEEN: 'false',
AUTO_STATUS_REACT: 'false',
AUTO_ONLINE: 'true',      // always online
AUTO_TYPING: 'true',      // typing status  AUTO_RECORDING: false   //
AUTO_RECORDING: 'false',
AUTO_CALL_END: 'true',
NEWSLETTER_JID: "120363424190990486@newsletter",
GROUP_INVITE_LINK: "https://chat.whatsapp.com/FGZiHK4LtN9IQSIWHfOSib",



};
