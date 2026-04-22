const https = require('https');

class XKCDModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'xkcd';
    this.latestNum = 0;
    this.fetchLatest();
  }

  getCommands() { return ['xkcd', 'комикс', 'comic']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd === 'xkcd' || cmd === 'комикс' || cmd === 'comic') {
      await this.sendComic(msg);
      return true;
    }

    return false;
  }

  async fetchLatest() {
    try {
      const data = await this.httpGet('https://xkcd.com/info.0.json');
      const json = JSON.parse(data);
      this.latestNum = json.num;
    } catch {
      this.latestNum = 2500;
    }
  }

  httpGet(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
  }

  async sendComic(msg) {
    const loading = await this.client.sendMessage(msg.chatId, {
      message: '🎨 Загружаю комикс...',
      replyTo: msg.id
    });

    try {
      const num = Math.floor(Math.random() * this.latestNum) + 1;
      const data = await this.httpGet(`https://xkcd.com/${num}/info.0.json`);
      const comic = JSON.parse(data);

      let text = `🎨 **XKCD #${comic.num}: ${comic.title}**\n\n`;
      text += `📖 ${comic.alt}\n\n`;
      text += `🔗 [Ссылка](${comic.img})`;

      await loading.edit({
        text: text,
        parseMode: 'markdown'
      });
    } catch (error) {
      await loading.edit({
        text: '❌ Не удалось загрузить комикс'
      });
    }
  }
}

module.exports = XKCDModule;