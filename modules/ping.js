class PingModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'ping';
  }

  getCommands() { return ['ping', 'пинг']; }

  async handleMessage(msg, text) {
    if (['ping', 'пинг'].includes(text.toLowerCase().trim())) {
      const uptime = Math.floor((Date.now() - this.bot.startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const mins = Math.floor((uptime % 3600) / 60);
      const secs = uptime % 60;
      
      await this.client.sendMessage(msg.chatId, {
        message: `🏓 **Pong!**\n\n` +
          `• Latency: ${Math.round(Date.now() - msg.date * 1000)}ms\n` +
          `• Uptime: ${hours}h ${mins}m ${secs}s\n` +
          `• Modules: ${this.bot.modules.size}`,
        parseMode: 'markdown',
        replyTo: msg.id
      });
      return true;
    }
    return false;
  }
}

module.exports = PingModule;