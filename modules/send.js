class SendModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'send';
    this.broadcastQueue = [];
    this.broadcasting = false;
  }

  getCommands() { return ['send', 'рассылка', 'broadcast']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    
    if (cmd.startsWith('send ') || cmd.startsWith('рассылка ')) {
      const content = text.replace(/^(send |рассылка )/, '').trim();
      if (content.includes(':')) {
        const [chat, message] = content.split(':').map(s => s.trim());
        if (chat && message) {
          await this.sendToChat(msg, chat, message);
          return true;
        }
      }
    }

    if (cmd.startsWith('broadcast ')) {
      const content = text.replace('broadcast ', '').trim();
      await this.startBroadcast(msg, content);
      return true;
    }

    if (cmd === 'send' || cmd === 'рассылка') {
      this.showHelp(msg);
      return true;
    }

    return false;
  }

  async showHelp(msg) {
    const helpText = `📨 **Рассылка**

Использование:
• \`send chat_id: сообщение\` - отправить в чат
• \`broadcast сообщение\` - всем контактам`;
    
    await this.client.sendMessage(msg.chatId, { 
      message: helpText, 
      parseMode: 'markdown', 
      replyTo: msg.id 
    });
  }

  async sendToChat(msg, chat, text) {
    try {
      let chatId = chat;
      
      if (!/^-?\d+$/.test(chat)) {
        const dialogs = await this.client.getDialogs({});
        const found = dialogs.find(d => 
          d.name?.toLowerCase().includes(chat.toLowerCase())
        );
        if (found) {
          chatId = found.id.toString();
        }
      }

      await this.client.sendMessage(chatId, { message: text });
      
      await this.client.sendMessage(msg.chatId, {
        message: `✅ Отправлено в ${chat}`,
        replyTo: msg.id
      });
    } catch (error) {
      await this.client.sendMessage(msg.chatId, {
        message: `❌ Ошибка: ${error.message}`,
        replyTo: msg.id
      });
    }
  }

  async startBroadcast(msg, text) {
    await this.client.sendMessage(msg.chatId, {
      message: '📨 Начинаю рассылку...',
      replyTo: msg.id
    });

    try {
      const dialogs = await this.client.getDialogs({});
      let sent = 0;
      let failed = 0;

      for (const dialog of dialogs) {
        if (!dialog.isGroup && dialog.id.toString() !== this.bot.botUserId?.toString()) {
          try {
            await this.client.sendMessage(dialog.id, { message: text });
            sent++;
            await this.delay(100);
          } catch {
            failed++;
          }
        }
      }

      await this.client.sendMessage(msg.chatId, {
        message: `✅ Рассылка завершена!\n\nОтправлено: ${sent}\nОшибок: ${failed}`
      });
    } catch (error) {
      await this.client.sendMessage(msg.chatId, {
        message: `❌ Ошибка: ${error.message}`
      });
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SendModule;