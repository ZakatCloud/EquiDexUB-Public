const https = require('https');

class TranslateModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'translate';
  }

  getCommands() { return ['translate', 'перевод', 'переведи']; }

  handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd.startsWith('перевод ') || cmd.startsWith('переведи ') || cmd.startsWith('translate ')) {
      const content = text.replace(/^(перевод |переведи |translate )/, '');
      this.translate(msg, content);
      return true;
    }

    if (cmd === 'перевод' || cmd === 'translate') {
      this.showHelp(msg);
      return true;
    }

    return false;
  }

  async showHelp(msg) {
    const helpText = `🌐 **Переводчик**

Использование:
• \`перевод текст\` - перевести на английский
• \`перевод ru:en текст\` - с русского на английский

Языки: en, ru, uk, es, fr, de, it, ja, zh`;
    
    await this.client.sendMessage(msg.chatId, { 
      message: helpText, 
      parseMode: 'markdown', 
      replyTo: msg.id 
    });
  }

  async translate(msg, content) {
    const loading = await this.client.sendMessage(msg.chatId, {
      message: '🌐 Перевожу...',
      replyTo: msg.id
    });

    let fromLang = 'auto';
    let toLang = 'en';
    let text = content;

    const langMatch = content.match(/^([a-z]{2}):([a-z]{2})\s+(.+)$/);
    if (langMatch) {
      fromLang = langMatch[1];
      toLang = langMatch[2];
      text = langMatch[3];
    }

    try {
      const translated = await this.doTranslate(text, fromLang, toLang);
      
      await loading.edit({
        text: `🌐 **Перевод** (${fromLang} → ${toLang}):\n\n${translated}`,
        parseMode: 'markdown'
      });
    } catch (error) {
      await loading.edit({
        text: '❌ Ошибка перевода: ' + error.message
      });
    }
  }

  async doTranslate(text, from, to) {
    return new Promise((resolve, reject) => {
      const encodedText = encodeURIComponent(text);
      const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${from}|${to}`;
      
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.responseStatus === 200 && result.responseData) {
              resolve(result.responseData.translatedText);
            } else {
              reject(new Error('Translation failed'));
            }
          } catch {
            reject(new Error('Parse error'));
          }
        });
      }).on('error', reject);
    });
  }
}

module.exports = TranslateModule;