const https = require('https');

class ShortLinkModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'shortlink';
  }

  getCommands() { return ['short', 'короче', 'shortlink', 'сократи']; }

  handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd.startsWith('короче ') || cmd.startsWith('short ') || cmd.startsWith('сократи ')) {
      const url = text.replace(/^(короче |short |сократи )/, '').trim();
      if (url.startsWith('http')) {
        this.shorten(msg, url);
        return true;
      }
    }

    if (cmd === 'short' || cmd === 'короче') {
      this.showHelp(msg);
      return true;
    }

    return false;
  }

  async showHelp(msg) {
    const helpText = `🔗 **Сокращатель ссылок**

Использование:
• \`short https://example.com\`
• \`короче https://example.com\`
• \`сократи https://example.com\``;
    
    await this.client.sendMessage(msg.chatId, { 
      message: helpText, 
      parseMode: 'markdown', 
      replyTo: msg.id 
    });
  }

  async shorten(msg, url) {
    const loading = await this.client.sendMessage(msg.chatId, {
      message: '🔗 Сокращаю...',
      replyTo: msg.id
    });

    try {
      const shortUrl = await this.getShortUrl(url);
      
      await loading.edit({
        text: `🔗 **Результат:**\n\n${shortUrl}`,
        parseMode: 'markdown'
      });
    } catch (error) {
      await loading.edit({
        text: '❌ Ошибка: ' + error.message
      });
    }
  }

  async getShortUrl(url) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ url });
      
      const options = {
        hostname: 'is.gd',
        port: 443,
        path: '/create.php',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(`url=${encodeURIComponent(url)}`)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const match = data.match(/value="(https:\/\/[^"]+)"/);
            if (match) {
              resolve(match[1]);
            } else {
              resolve(url);
            }
          } catch {
            resolve(url);
          }
        });
      });

      req.on('error', reject);
      req.write(`url=${encodeURIComponent(url)}`);
      req.end();
    });
  }
}

module.exports = ShortLinkModule;