const mongoose = require('mongoose');
const config = require('../config');

// MongoDB Connection
mongoose.connect(config.MONGODB_URL || 'mongodb+srv://oshadhaoshadha12345_db_user:SH0m8ksHl8A0ZfBF@oshiya.bc9b5e4.mongodb.net/?appName=Oshiya')
    .then(() => console.log('✅ DataBass Connected 🔌'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 1. Settings Schema (පවතින එක)
const SettingsSchema = new mongoose.Schema({
    id: { type: String, default: 'main_settings' },
    AUTO_CALL_END: { type: Boolean, default: false },
    AUTO_MG_REACT: { type: Boolean, default: false },
    AUTO_STATUS_SEEN: { type: Boolean, default: false },
    AUTO_STATUS_REACT: { type: Boolean, default: false },
    PREFIX: { type: String, default: '.' }
});

const Settings = mongoose.model('Settings', SettingsSchema);

// 2. Session Schema (අලුතින් එකතු කළ යුත්තේ මෙයයි)
// මෙහි key ලෙස තැන්පත් වන්නේ "ᴏꜱʜɪʏᴀ~..." යන session ID එකයි
const SessionSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Object, required: true } // මෙහි creds.json එකේ දත්ත තැන්පත් වේ
});

const Session = mongoose.model('Session', SessionSchema);

// 3. දෙකම Export කිරීම
module.exports = { 
    Settings, 
    Session 
};
