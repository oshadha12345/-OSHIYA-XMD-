const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "ᴏꜱʜɪʏᴀ~qclAxYBZ#gJtvOqVMZfbCM0YSsq_dKmfPmI0tp481-LhBA_JVjXc",
ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/oshadha12345/images/refs/heads/main/20251222_040815.jpg",
ALIVE_MSG: process.env.ALIVE_MSG || "*Hello👋 DANUWA-MD Is Alive Now😍*",
BOT_OWNER: '94725364886',  // Replace with the owner's phone number
AUTO_STATUS_SEND: process.env.AUTO_STATUS_SEND || "true",
AUTO_STATUS_SEEN: 'true',
AUTO_STATUS_REACT: 'true',



};
