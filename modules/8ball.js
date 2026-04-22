class MagicBallModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = '8ball';
    this.answers = [
      { text: '🎱 Да!', type: 'positive' },
      { text: '🎱 Безусловно!', type: 'positive' },
      { text: '🎱 Определённо да', type: 'positive' },
      { text: '🎱 Можешь на это рассчитывать', type: 'positive' },
      { text: '🎱 Как мне кажется - да', type: 'positive' },
      { text: '🎱 Скорее всего', type: 'positive' },
      { text: '🎱 Перспективы хорошие', type: 'positive' },
      { text: '🎱 Да', type: 'positive' },
      { text: '🎱 Знаки указывают на да', type: 'positive' },
      { text: '🎱 Ответ туманный, попробуй снова', type: 'neutral' },
      { text: '🎱 Спроси позже', type: 'neutral' },
      { text: '🎱 Лучше не говори сейчас', type: 'neutral' },
      { text: '🎱 Сконцентрируйся и спроси снова', type: 'neutral' },
      { text: '🎱 Не могу сейчас ответить', type: 'neutral' },
      { text: '🎱 Не рассчитывай на это', type: 'negative' },
      { text: '🎱 Мой ответ - нет', type: 'negative' },
      { text: '🎱 Перспективы не очень', type: 'negative' },
      { text: '🎱 Сомневаюсь', type: 'negative' },
      { text: '🎱 Нет', type: 'negative' },
      { text: '🎱 Очень сомнительно', type: 'negative' }
    ];
  }

  getCommands() { return ['8ball', 'шар', 'магический шар']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd.includes('8ball') || cmd.includes('шар') || cmd.includes('магическ')) {
      await this.askBall(msg);
      return true;
    }

    return false;
  }

  async askBall(msg) {
    const answer = this.answers[Math.floor(Math.random() * this.answers.length)];
    
    const emojis = {
      positive: ['✨', '⭐', '🌟'],
      neutral: ['🤔', '😐', '😶'],
      negative: ['💔', '😔', '😢']
    };
    
    const emoji = emojis[answer.type][Math.floor(Math.random() * emojis[answer.type].length)];
    
    await this.client.sendMessage(msg.chatId, {
      message: emoji + ' ' + answer.text,
      replyTo: msg.id
    });
  }
}

module.exports = MagicBallModule;