const fs = require('fs');
const path = require('path');

class SettingsModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'settings';
    this.settingsFile = path.join(__dirname, '..', 'settings.json');
    this.settings = this.loadSettings();
  }

  getCommands() { return ['settings', 'настройки']; }

  handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd === 'settings' || cmd === 'настройки') {
      this.showSettings(msg);
      return true;
    }

    if (cmd.startsWith('настройки ')) {
      const parts = cmd.replace('настройки ', '').split(' ');
      if (parts.length >= 2) {
        this.setSetting(msg, parts[0], parts.slice(1).join(' '));
        return true;
      }
    }

    return false;
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsFile)) {
        return JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'));
      }
    } catch {}
    return {
      language: 'ru',
      notifications: true,
      timezone: 'Europe/Moscow'
    };
  }

  saveSettings() {
    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify(this.settings, null, 2));
    } catch {}
  }

  async showSettings(msg) {
    let text = '⚙️ **Настройки**\n\n';
    
    for (const [key, value] of Object.entries(this.settings)) {
      text += `• ${key}: \`${value}\`\n`;
    }

    text += '\n💡 Изменить: `настройки [клюз] [значение]`';

    await this.client.sendMessage(msg.chatId, { 
      message: text, 
      parseMode: 'markdown', 
      replyTo: msg.id 
    });
  }

  async setSetting(msg, key, value) {
    this.settings[key] = value;
    this.saveSettings();
    
    await this.client.sendMessage(msg.chatId, {
      message: `✅ Сохранено: ${key} = ${value}`,
      replyTo: msg.id
    });
  }
}

module.exports = SettingsModule;