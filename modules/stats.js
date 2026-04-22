class StatsModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'stats';
  }

  getCommands() { return ['stats', 'статистика', 'stat']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    if (['stats', 'статистика', 'stat'].includes(cmd)) {
      await this.showStats(msg);
      return true;
    }
    return false;
  }

  async showStats(msg) {
    const sorted = [...this.bot.commandStats.entries()].sort((a, b) => b[1] - a[1]);
    
    let text = '📊 **Статистика использования**\n\n';
    
    if (sorted.length === 0) {
      text += '📭 Нет данных';
    } else {
      for (const [name, count] of sorted) {
        const bar = this.getBar(count, sorted[0][1]);
        text += `• ${name}: ${count} ${bar}\n`;
      }
    }

    const uptime = Math.floor((Date.now() - this.bot.startTime) / 1000);
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);

    text += '\n⏱ **System:**\n';
    text += `• Uptime: ${days}д ${hours}ч ${mins}м\n`;
    text += `• Modules: ${this.bot.modules.size}`;

    const totalCommands = sorted.reduce((sum, [_, count]) => sum + count, 0);
    text += `\n• Всего команд: ${totalCommands}`;

    await this.client.sendMessage(msg.chatId, { 
      message: text, 
      parseMode: 'markdown', 
      replyTo: msg.id 
    });
  }

  getBar(count, max) {
    const bars = 5;
    const filled = Math.round((count / max) * bars);
    return '█'.repeat(filled) + '░'.repeat(bars - filled);
  }
}

module.exports = StatsModule;