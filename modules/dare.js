class DareModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'dare';
    this.dares = [
      '📸 Отправь селфи с глупым выражением лица',
      '💬 Напиши сообщение на английском любому контакту',
      '🎵 Спой куплет любимой песни',
      '📝 Напиши 3 факта о себе, которых никто не знает',
      '🎭 Изобрази животное в течение 10 секунд',
      '📱 Поставь смешную автоответ',
      '💭 Расскажи свой самый неловкий момент',
      '🎲 Брось монетку и сделай что выпадет',
      '📸 Отправь скриншот последнего фото в галерее',
      '💬 Сделай комплимент себе в зеркало',
      '🎵 Потанцуй 30 секунд под любую музыку',
      '📝 Напиши стихотворение из 4 строк',
      '💭 Расскажи свою главную слабость',
      '🎭 Изобрази эмоцию: счастье, грусть, злость',
      '📸 Отправь фото с самым глупым фильтром',
      '💬 Расскажи анекдот',
      '🎲 Сделай ставку и выполни если проиграешь',
      '📱 Поставь смешную статус на 1 час',
      '💭 Назови 3 своих главных страха',
      '🎤 Сделай голосовое сообщение с шёпотом'
    ];
  }

  getCommands() { return ['dare', 'правда', 'действие', 'challenge']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (['dare', 'правда', 'challenge'].includes(cmd)) {
      await this.sendDare(msg);
      await this.client.sendMessage(msg.chatId, { message: '🥴 **ПРАВДА ИЛИ ДЕЙСТВИЕ**', parseMode: 'markdown' });
      return true;
    }

    return false;
  }

  async sendDare(msg) {
    const dare = this.dares[Math.floor(Math.random() * this.dares.length)];
    
    await this.client.sendMessage(msg.chatId, {
      message: `🎯 **ИСПЫТАНИЕ:**\n\n${dare}`,
      parseMode: 'markdown',
      replyTo: msg.id
    });
  }
}

module.exports = DareModule;