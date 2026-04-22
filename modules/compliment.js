class ComplimentModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'compliment';
    this.compliments = [
      'Ты невероятно крутой! 🔥',
      'У тебя отличное чувство юмора! 😄',
      'Ты умный и талантливый! 🧠',
      'С тобой приятно общаться! 💬',
      'Ты делаешь мир лучше! ✨',
      'У тебя золотое сердце! ❤️',
      'Ты вдохновляешь других! 🌟',
      'Ты настоящий профессионал! 💪',
      'Твоя улыбка заразительна! 😊',
      'Ты уникален и неповторим! 🌈',
      'С тобой классно! 🎉',
      'Ты молодец! 👍',
      'Ты супер! ⭐',
      'Верю в тебя! 🙏',
      'Ты лучший! 👑',
      'У тебя всё получится! 🚀',
      'Ты потрясающий! 🤩',
      'Горжусь тобой! 🏆',
      'Ты настоящий друг! 🤝',
      'Ты создаешь магию! ✨'
    ];
  }

  getCommands() { return ['compliment', 'комплимент', 'похвали']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd === 'compliment' || cmd === 'комплимент' || cmd === 'похвали') {
      if (msg.replyTo) {
        await this.complimentUser(msg);
      } else {
        await this.complimentMe(msg);
      }
      return true;
    }

    return false;
  }

  async complimentUser(msg) {
    const compliment = this.compliments[Math.floor(Math.random() * this.compliments.length)];
    
    try {
      const repliedMsg = await this.client.getMessages(msg.chatId, { ids: msg.replyTo.replyToMsgId });
      if (repliedMsg && repliedMsg[0]) {
        const user = await this.client.getEntity(repliedMsg[0].senderId);
        
        await this.client.sendMessage(msg.chatId, {
          message: `💖 **${user.firstName || 'User'}**, ${compliment.toLowerCase()}`,
          parseMode: 'markdown',
          replyTo: msg.id
        });
      }
    } catch {
      await this.client.sendMessage(msg.chatId, {
        message: compliment,
        replyTo: msg.id
      });
    }
  }

  async complimentMe(msg) {
    const compliment = this.compliments[Math.floor(Math.random() * this.compliments.length)];
    
    await this.client.sendMessage(msg.chatId, {
      message: compliment,
      replyTo: msg.id
    });
  }
}

module.exports = ComplimentModule;