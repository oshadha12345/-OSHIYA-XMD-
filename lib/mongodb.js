const mongoose = require('mongoose');
const config = require('../config');

// MongoDB Connection
mongoose.connect(config.MONGODB_URL || 'mongodb+srv://oshadhaoshadha12345_db_user:SH0m8ksHl8A0ZfBF@oshiya.bc9b5e4.mongodb.net/?appName=Oshiya')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const SettingsSchema = new mongoose.Schema({
    id: { type: String, default: 'main_settings' },
    AUTO_CALL_END: { type: Boolean, default: false },
    AUTO_MG_REACT: { type: Boolean, default: false },
    AUTO_STATUS_SEEN: { type: Boolean, default: false },
    AUTO_STATUS_REACT: { type: Boolean, default: false }
});

const Settings = mongoose.model('Settings', SettingsSchema);

// Settings ලබාගන්නා Helper Function
async function getDBSettings() {
    let settings = await Settings.findOne({ id: 'main_settings' });
    if (!settings) {
        settings = await Settings.create({ id: 'main_settings' });
    }
    return settings;
  }
