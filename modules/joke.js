class JokeModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'joke';
    this.jokes = [
      '— Почему программист ушёл с работы?\n— Потому что он не получил массив (массив = много денег)!',
      '— Что сказал ноль восьмёрке?\n— Классный ремень!',
      'Программист говорит жене:\n— Дорогая, я пошёл в магазин. Купить чего-нибудь?\n— Да, купи буханку хлеба.\n— А если не будет?\n— Тогда возьми буханку!\n— А если не будет?\n— Возьми две!',
      '— Сколько программистов нужно чтобы поменять лампочку?\n— Ни одного, это hardware-проблема',
      '— Говорят, хороший программист ленивый.\n— Да, поэтому мы автоматизируем всё, даже лень.',
      'Программист проснулся в 3 часа ночи.\n— Почему ты не спишь?\n— Забыл закрыть цикл while.',
      '— У меня код не работает!\n— А ты debug делал?\n— Да, я даже print добавил в каждую строку!\n— И что?\n— Теперь у меня 2000 строк логов.',
      'Идёт программист по пустыне. Передумал, вернулся обратно.',
      '— Мама, а откуда берутся дети?\n— Это тебе напишут в документации.',
      'Почему программисты путают Хэллоуин и Рождество?\nПотому что OCT 31 = DEC 25'
    ];
  }

  getCommands() {
    return ['шутка', 'анекдот', 'joke'];
  }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    if (['шутка', 'анекдот', 'joke'].includes(cmd)) {
      await this.sendJoke(msg);
      return true;
    }
    return false;
  }

  async sendJoke(msg) {
    const joke = this.jokes[Math.floor(Math.random() * this.jokes.length)];
    await this.client.sendMessage(msg.chatId, { message: `😂 **ШУТКА**\n\n${joke}`, parseMode: 'markdown', replyTo: msg.id });
  }
}

module.exports = JokeModule;