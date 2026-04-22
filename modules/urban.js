class UrbanModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'urban';
    this.quotes = [
      { quote: 'Код работает - не трогай', author: 'Древняя мудрость' },
      { quote: 'Проще сломать чем починить', author: 'Т Murphy' },
      { quote: 'Существует 10 типов людей: те кто понимает двоичную систему и те кто нет', author: 'Неизвестно' },
      { quote: 'Семь раз отмерь - один раз отладь', author: 'Пограммисты' },
      { quote: 'Будущее уже здесь - оно просто неравномерно распределено', author: 'William Gibson' },
      { quote: 'Любой дурак может написать код, понятный компьютеру. Хороший программист пишет код, понятный людям', author: 'Martin Fowler' },
      { quote: 'Сначала они тебя игнорируют, потом смеются над тобой, потом борются с тобой, а потом ты побеждаешь', author: 'Ганди' },
      { quote: 'Есть два способа писать программы: первый - делать это настолько просто, что очевидно, что нет ошибок; второй - делать это настолько сложно, что нет очевидных ошибок', author: 'Tony Hoare' },
      { quote: 'Программирование - это как говорить на иностранном языке: если не знаешь хоть один, то не знаешь ни одного', author: 'Неизвестно' },
      { quote: 'Не объясняй - покажи код', author: 'LinTorvalds' },
      { quote: 'Тестирование показывает наличие багов, а не их отсутствие', author: 'Edsger W. Dijkstra' },
      { quote: 'Просто работает - не трогай', author: 'Древняя мудрость' },
      { quote: 'Преждевременная оптимизация - корень всего зла', author: 'Donald Knuth' },
      { quote: 'Человек с молотом видит гвозди everywhere', author: 'Abraham Maslow' },
      { quote: 'Компьютеры хороши в том, что делают то, что им говорят, а не то, что вы хотите', author: 'Douglas Adams' }
    ];
  }

  getCommands() { return ['urban', 'цитата', 'quote']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd === 'urban' || cmd === 'цитата' || cmd === 'quote') {
      await this.sendQuote(msg);
      return true;
    }

    return false;
  }

  async sendQuote(msg) {
    const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    
    await this.client.sendMessage(msg.chatId, {
      message: `💬 **${quote.quote}**\n\n— ${quote.author}`,
      parseMode: 'markdown',
      replyTo: msg.id
    });
  }
}

module.exports = UrbanModule;