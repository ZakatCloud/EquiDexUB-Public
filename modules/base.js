class BaseModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'base';
  }

  getCommands() {
    return ['тест', 'статус', 'айди', 'info'];
  }

  async handleMessage(msg, text) {
    if (text.includes('тест')) {
      await this.client.sendMessage(msg.chatId, {
        message: '✅ EquiDex UserBot работает!\nМодульная система активна.',
        replyTo: msg.id
      });
      return true;
    }

    if (text.includes('статус')) {
      const modules = this.bot.modules.size;
      await this.client.sendMessage(msg.chatId, {
        message: `✅ Бот онлайн!\n📦 Модулей: ${modules}`,
        replyTo: msg.id
      });
      return true;
    }

    if (text.includes('айди') || text === 'info') {
      await this.showUserInfo(msg);
      return true;
    }

    return false;
  }

  async showUserInfo(msg) {
    try {
      const me = await this.client.getMe();
      const user = await this.client.getEntity(msg.senderId);

      let info = '👤 **Информация**\n\n';
      info += `**Имя:** ${user.firstName || 'N/A'}\n`;
      if (user.lastName) info += `**Фамилия:** ${user.lastName}\n`;
      info += `**Username:** @${user.username || 'нет'}\n`;
      info += `**ID:** ${user.id}`;

      await this.client.sendMessage(msg.chatId, {
        message: info,
        parseMode: 'markdown',
        replyTo: msg.id
      });
    } catch (error) {
      await this.client.sendMessage(msg.chatId, {
        message: '❌ Ошибка получения данных',
        replyTo: msg.id
      });
    }
  }
}

module.exports = BaseModule;