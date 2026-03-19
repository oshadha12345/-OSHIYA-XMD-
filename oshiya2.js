const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

const { DBCONFIG } = require("./lib/db");

function convertToBool(text, fault = 'true') { return text === fault ? true : false; }

module.exports = {
    SESSION_ID: process.env.SESSION_ID || "ᴏꜱʜɪʏᴀ~aNNlmQaB#L7Ka-9DhlDpy55C5d-Fln1af9mFq0LOsovENoj_v34k",
    OWNER_NAME: process.env.OWNER_NAME || "Oshiya💗",
    OWNER_NUMBER: '94725364886',
    AUTO_STATUS_SEND: process.env.AUTO_STATUS_SEND || "true",
    MODE: "private",
    PREFIX: ".",
    AUTO_STATUS_SEEN: 'false',
    AUTO_STATUS_REACT: 'false',
    AUTO_ONLINE: 'true',
    AUTO_TYPING: 'true',
    AUTO_RECORDING: 'false',
    AUTO_CALL_END: 'true',
    NEWSLETTER_JID: "120363424190990486@newsletter",
    GROUP_INVITE_LINK: "https://chat.whatsapp.com/FGZiHK4LtN9IQSIWHfOSib",
};

// 🔥 Live update from MongoDB every 2 seconds
setInterval(() => {
    if (DBCONFIG.AUTO_TYPING !== undefined) module.exports.AUTO_TYPING = String(DBCONFIG.AUTO_TYPING);
    if (DBCONFIG.AUTO_RECORDING !== undefined) module.exports.AUTO_RECORDING = String(DBCONFIG.AUTO_RECORDING);
    if (DBCONFIG.AUTO_ONLINE !== undefined) module.exports.AUTO_ONLINE = String(DBCONFIG.AUTO_ONLINE);
}, 2000);
