class ProfileModule {
  constructor(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'profile';
    this.startTime = Date.now();
  }

  getCommands() { return ['профиль', 'profile', 'me']; }

  async handleMessage(msg, text) {
    const cmd = text.toLowerCase().trim();
    if (['профиль', 'profile', 'me'].includes(cmd)) {
      await this.showProfile(msg);
      return true;
    }
    return false;
  }

  formatDate(date) {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  async showProfile(msg) {
    try {
      const me = await this.client.getMe();
      const uptime = Math.floor((Date.now() - this.bot.startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const mins = Math.floor((uptime % 3600) / 60);

      const rank = me.id.toString() === '694936338' ? '👑 Разработчик' : '👤 Пользователь';

      const name = [me.first_name, me.last_name].filter(Boolean).join(' ') || 'Не указано';
      const lang = this.getLanguageName(me.language_code);

      const profileText = [
        '╔════════════════════════════════╗',
        '║     👤 EQUIDEX PROFILE        ║',
        '╠════════════════════════════════╣',
        '',
        `  🏷 Имя: ${name}`,
        `  👤 Username: @${me.username || 'скрыт'}`,
        `  🆔 ID: ${me.id}`,
        '',
        `  🌐 Язык: ${lang}`,
        '',
        `  ⏱ Время работы: ${hours}ч ${mins}м`,
        '',
        `  📦 Модули: ${this.bot.modules.size}`,
        '',
        '╠════════════════════════════════╣',
        '',
        `  ${rank}`,
        '',
        '╚════════════════════════════════╝'
      ].join('\n');

      await this.client.sendMessage(msg.chatId, {
        message: profileText,
        parseMode: 'none',
        replyTo: msg.id
      });

    } catch (error) {
      console.log('Profile error:', error.message);
      await this.client.sendMessage(msg.chatId, {
        message: '❌ Ошибка получения профиля'
      });
    }
  }

  getLanguageName(code) {
    const languages = {
      'ru': 'Русский 🇷🇺',
      'en': 'Английский 🇬🇧',
      'uk': 'Украинский 🇺🇦',
      'be': 'Белорусский 🇧🇾',
      'kk': 'Казахский 🇰🇿',
      'uz': 'Узбекский 🇺🇿'
    };
    return languages[code] || `Unknown (${code})`;
  }
}

module.exports = ProfileModule;