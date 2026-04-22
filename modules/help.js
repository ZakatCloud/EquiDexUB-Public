class HelpModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'help';
  }

  getCommands() { return ['help', 'помощь', ' команды', 'commands']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    if (['help', 'помощь', ' команды', 'commands'].includes(cmd)) {
      await this.showHelp(msg);
      return true;
    }
    return false;
  }

  async showHelp(msg) {
    let text = '🤖 **EquiDex UserBot**\n\n';
    text += '📦 **Модули:**\n\n';
    
    const categories = {
      '🔧 Утилиты': ['ping', 'calculator', 'translate', 'time', 'whois'],
      '🎮 Развлечения': ['joke', 'fact', '8ball', 'fortune', 'xkcd'],
      '📝 Полезное': ['notes', 'reminds', 'shortlink', 'weather']
    };

    for (const [category, modules] of Object.entries(categories)) {
      text += `${category}:\n`;
      for (const modName of modules) {
        const mod = this.bot.modules.get(modName);
        if (mod) {
          const cmds = mod.getCommands?.() || [];
          if (cmds.length) {
            text += `  • ${cmds[0]}\n`;
          }
        }
      }
      text += '\n';
    }

    text += '💡 **Система:**\n';
    text += '• modules - список модулей\n';
    text += '• reload [имя] - перезагрузить\n';
    text += '• stats - статистика';

    await this.client.sendMessage(msg.chatId, { 
      message: text, 
      parseMode: 'markdown', 
      replyTo: msg.id 
    });
  }
}

module.exports = HelpModule;