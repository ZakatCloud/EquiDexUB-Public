class RipModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'rip';
    this.responses = [
      '💀 *закатывает глаза*',
      '💀 Ну и что дальше?',
      '💀 Оригинально...',
      '💀 Мы все умрём, да.',
      '💀 Какой глубокий смысл...',
      '💀 Окей?',
      '💀 И что это должно значить?',
      '💀 Пффф...',
      '💀 Каждый день кто-то умирает.',
      '💀 Это было очень страшно, честно.'
    ];
  }

  getCommands() { return ['rip', 'умри', 'кек', 'lmao']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (['rip', 'умри', 'кек', 'lmao'].includes(cmd)) {
      const response = this.responses[Math.floor(Math.random() * this.responses.length)];
      await this.client.sendMessage(msg.chatId, {
        message: response,
        replyTo: msg.id
      });
      return true;
    }

    return false;
  }
}

module.exports = RipModule;