const mongoose = require('mongoose');
const config = require('../config');

// MongoDB Connection
mongoose.connect(config.MONGODB_URL || 'mongodb+srv://oshadhaoshadha12345_db_user:SH0m8ksHl8A0ZfBF@oshiya.bc9b5e4.mongodb.net/?appName=Oshiya')
    .then(() => console.log('✅ DataBass Connected 🔌'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const SettingsSchema = new mongoose.Schema({
    id: { type: String, default: 'main_settings' },
    AUTO_CALL_END: { type: Boolean, default: false },
    AUTO_MG_REACT: { type: Boolean, default: false },
    AUTO_STATUS_SEEN: { type: Boolean, default: false },
    AUTO_STATUS_REACT: { type: Boolean, default: false },
    PREFIX: { type: String, default: '.' }
});

const Settings = mongoose.model('Settings', SettingsSchema);

// --- මෙන්න මේ ටික අනිවාර්යයෙන්ම එකතු කරන්න ---
module.exports = { Settings };
