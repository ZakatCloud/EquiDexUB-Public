class FortuneModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'fortune';
    this.fortunes = [
      { emoji: '🌟', text: 'Тебя ждёт успех во всех начинаниях!', type: 'good' },
      { emoji: '💰', text: 'Скоро придёт финансовое благополучие!', type: 'good' },
      { emoji: '💕', text: 'Любовь рядом - оглянись!', type: 'love' },
      { emoji: '🎉', text: 'Тебя ждёт приятный сюрприз!', type: 'good' },
      { emoji: '🚀', text: 'Сейчас время действовать - успех гарантирован!', type: 'good' },
      { emoji: '💭', text: 'Прислушайся к своей интуиции - она не подведёт!', type: 'neutral' },
      { emoji: '🌈', text: 'После дождя будет солнце - всё наладится!', type: 'good' },
      { emoji: '⏰', text: 'Терпение - твой союзник. Подожди ещё немного.', type: 'neutral' },
      { emoji: '🔮', text: 'Твоя мечта сбудется, но не так и не тогда, когда ожидаешь.', type: 'neutral' },
      { emoji: '🎯', text: 'Сосредоточься на главном - остальное приложится.', type: 'good' },
      { emoji: '⚡', text: 'Скоро произойдёт важная встреча, которая изменит жизнь.', type: 'good' },
      { emoji: '🌊', text: 'Возможны небольшие трудности, но ты справишься!', type: 'neutral' },
      { emoji: '🔑', text: 'Ответ на твой вопрос - прямо перед тобой.', type: 'neutral' },
      { emoji: '⭐', text: 'Звёзды благоволят тебе сегодня!', type: 'good' },
      { emoji: '🎲', text: 'Случай решит всё за тебя - прими вызов!', type: 'neutral' },
      { emoji: '🌙', text: 'Доверься своей интуиции, а не логике.', type: 'neutral' },
      { emoji: '🏔', text: 'Скоро начнётся новый этап - готовься!', type: 'good' },
      { emoji: '💎', text: 'Твоя ценность будет признана - терпение!', type: 'good' },
      { emoji: '🔥', text: 'Твоя энергия на пике - используй её с умом!', type: 'good' },
      { emoji: '🕊', text: 'Отпусти прошлое - будущее тебя ждёт!', type: 'neutral' }
    ];
  }

  getCommands() { return ['fortune', 'судьба', 'предсказание', 'гадание']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd === 'fortune' || cmd === 'судьба' || cmd === 'предсказание' || cmd === 'гадание') {
      await this.tellFortune(msg);
      return true;
    }

    return false;
  }

  async tellFortune(msg) {
    const fortune = this.fortunes[Math.floor(Math.random() * this.fortunes.length)];
    
    const borders = {
      good: ['╔══════════════════════════════╗', '╚══════════════════════════════╝'],
      neutral: ['╭──────────────────────────────╮', '╰──────────────────────────────╯'],
      love: ['♥──────────────────────────────♥', '♥──────────────────────────────♥']
    };

    const border = borders[fortune.type] || borders.neutral;
    
    const message = `${border[0]}\n${fortune.emoji} **ПРЕДСКАЗАНИЕ** ${fortune.emoji}\n${fortune.text}\n${border[1]}`;

    await this.client.sendMessage(msg.chatId, {
      message: message,
      parseMode: 'markdown',
      replyTo: msg.id
    });
  }
}

module.exports = FortuneModule;