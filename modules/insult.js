class InsultModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'insult';
    this.insults = [
      'Ты умнее чем выглядишь... но это очень далеко видно.',
      'Если бы тупость была болью, ты бы уже кричал.',
      'Ты как облако - пустой и бесполезный.',
      'Извини, я не поняла - это был звук или слова?',
      'Ты вообще понимаешь когда говоришь?',
      'Я бы назвала тебя глупым, но боюсь обидеть облака.',
      'У тебя есть мнение? Не может быть...',
      'Ты это\nнарочно?\nИли просто так получается?',
      'Солнце умнее тебя, и оно хотя бы светит.',
      'Глупость - это не диагноз, это образ жизни.',
      'Ты в порядке? Потому что звучит как нет.',
      'Я слышала про умных людей. Это не ты.',
      'Ты как интернет - медленный и нестабильный.',
      'Это было мило. Но глупо.',
      'Попробуй ещё раз. В третий раз может повезёт.'
    ];
  }

  getCommands() { return ['insult', 'оскорбление', 'обидь']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd === 'insult' || cmd === 'оскорбление' || cmd === 'обидь') {
      if (msg.replyTo) {
        await this.insultUser(msg);
      } else {
        await this.client.sendMessage(msg.chatId, {
          message: '❓ Кого нужно обидеть? (ответь на сообщение)',
          replyTo: msg.id
        });
      }
      return true;
    }

    return false;
  }

  async insultUser(msg) {
    const insult = this.insults[Math.floor(Math.random() * this.insults.length)];
    
    try {
      const repliedMsg = await this.client.getMessages(msg.chatId, { ids: msg.replyTo.replyToMsgId });
      if (repliedMsg && repliedMsg[0]) {
        const user = await this.client.getEntity(repliedMsg[0].senderId);
        
        await this.client.sendMessage(msg.chatId, {
          message: `💢 **${user.firstName || 'User'}**, ${insult.toLowerCase()}`,
          parseMode: 'markdown',
          replyTo: msg.id
        });
      }
    } catch {
      await this.client.sendMessage(msg.chatId, {
        message: insult,
        replyTo: msg.id
      });
    }
  }
}

module.exports = InsultModule;